import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import {
  buildAmortizationSchedule,
  computeNextDueDate,
  daysUntilDue,
} from '@finance-tracker/finance-utils';
import type { ExpenseType } from '@finance-tracker/shared';
import { CategoriesService } from '../categories/categories.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import {
  AnyExpenseDocument,
  Expense,
  ExpenseDocument,
  InstallmentPayment,
} from './schemas/expense.schema';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { QueryExpenseDto } from './dto/query-expense.dto';
import { PayInstallmentDto } from './dto/pay-installment.dto';

export interface PaginatedExpenses {
  data: AnyExpenseDocument[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name)
    private readonly expenseModel: Model<ExpenseDocument>,
    private readonly categoriesService: CategoriesService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  private discriminatorModel(type: ExpenseType): Model<AnyExpenseDocument> {
    const model = this.expenseModel.discriminators?.[type] as
      Model<AnyExpenseDocument> | undefined;
    if (!model) {
      throw new BadRequestException(`Unsupported expense type: ${type}`);
    }
    return model;
  }

  async create(
    userId: string,
    dto: CreateExpenseDto,
  ): Promise<AnyExpenseDocument> {
    await this.categoriesService.findOneForUser(dto.categoryId, userId);

    const common = {
      userId,
      categoryId: dto.categoryId,
      currency: dto.currency ?? 'USD',
      notes: dto.notes,
    };

    let saved: AnyExpenseDocument;

    if (dto.type === 'simple') {
      const date = new Date(dto.date);
      const doc = new (this.discriminatorModel('simple'))({
        ...common,
        amount: dto.amount,
        date,
      });
      saved = await doc.save();
    } else if (dto.type === 'recurring') {
      const startDate = new Date(dto.startDate);
      const doc = new (this.discriminatorModel('recurring'))({
        ...common,
        description: dto.description,
        amount: dto.amount,
        date: startDate,
        frequency: dto.frequency,
        startDate,
        nextDueDate: startDate,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        isActive: true,
      });
      saved = await doc.save();
    } else {
      // installment
      const startDate = new Date(dto.startDate);
      const interestType = dto.interestType ?? 'none';
      const schedule = buildAmortizationSchedule(
        dto.totalAmount,
        dto.numInstallments,
        dto.interestRate ?? 0,
        interestType,
        startDate,
      );
      const doc = new (this.discriminatorModel('installment'))({
        ...common,
        description: dto.description,
        amount: dto.totalAmount,
        date: startDate,
        totalAmount: dto.totalAmount,
        numInstallments: dto.numInstallments,
        installmentAmount:
          schedule[0]?.totalDue ??
          round2(dto.totalAmount / dto.numInstallments),
        interestRate: dto.interestRate,
        interestType,
        startDate,
        paymentSchedule: schedule,
      });
      saved = await doc.save();
    }

    this.realtimeGateway.emitExpenseCreated(userId, saved);
    return saved;
  }

  async findAllForUser(
    userId: string,
    query: QueryExpenseDto,
  ): Promise<PaginatedExpenses> {
    const filter: FilterQuery<ExpenseDocument> = {
      userId,
      deletedAt: { $exists: false },
    };
    if (query.type) filter.type = query.type;
    if (query.categoryId) filter.categoryId = query.categoryId;
    if (query.dateFrom || query.dateTo) {
      const dateFilter: { $gte?: Date; $lte?: Date } = {};
      if (query.dateFrom) dateFilter.$gte = new Date(query.dateFrom);
      if (query.dateTo) dateFilter.$lte = new Date(query.dateTo);
      filter.date = dateFilter;
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = query.sortBy ?? 'date';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.expenseModel
        .find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.expenseModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOneForUser(
    id: string,
    userId: string,
  ): Promise<AnyExpenseDocument> {
    const expense = await this.expenseModel
      .findOne({ _id: id, userId, deletedAt: { $exists: false } })
      .exec();
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateExpenseDto,
  ): Promise<AnyExpenseDocument> {
    const expense = await this.findOneForUser(id, userId);

    if (dto.categoryId !== undefined) {
      await this.categoriesService.findOneForUser(dto.categoryId, userId);
      expense.categoryId = dto.categoryId;
    }
    if (dto.currency !== undefined) expense.currency = dto.currency;
    if (dto.notes !== undefined) expense.notes = dto.notes;

    if (expense.type === 'simple') {
      if ('amount' in dto && dto.amount !== undefined) {
        expense.amount = dto.amount;
      }
      if ('date' in dto && dto.date !== undefined) {
        expense.date = new Date(dto.date);
      }
    }

    if (expense.type === 'recurring') {
      if ('description' in dto && dto.description !== undefined) {
        expense.description = dto.description;
      }
      if ('amount' in dto && dto.amount !== undefined) {
        expense.amount = dto.amount;
      }
      if ('frequency' in dto && dto.frequency !== undefined) {
        expense.frequency = dto.frequency;
      }
      if ('endDate' in dto && dto.endDate !== undefined) {
        expense.endDate = new Date(dto.endDate);
      }
      if ('isActive' in dto && dto.isActive !== undefined) {
        expense.isActive = dto.isActive;
      }
    }

    if (expense.type === 'installment') {
      if ('description' in dto && dto.description !== undefined) {
        expense.description = dto.description;
      }
      const changingInterest =
        ('interestRate' in dto && dto.interestRate !== undefined) ||
        ('interestType' in dto && dto.interestType !== undefined);

      if ('interestRate' in dto && dto.interestRate !== undefined) {
        expense.interestRate = dto.interestRate;
      }
      if ('interestType' in dto && dto.interestType !== undefined) {
        expense.interestType = dto.interestType;
      }

      if (changingInterest && expense.totalAmount && expense.numInstallments) {
        expense.paymentSchedule = this.rebuildInstallmentSchedule(expense);
        expense.installmentAmount =
          expense.paymentSchedule[0]?.totalDue ?? expense.installmentAmount;
      }
    }

    const saved = await expense.save();
    this.realtimeGateway.emitExpenseUpdated(userId, saved);
    return saved;
  }

  /** Rebuilds the schedule for not-yet-paid installments, preserving paid ones. */
  private rebuildInstallmentSchedule(
    expense: AnyExpenseDocument,
  ): InstallmentPayment[] {
    const newSchedule = buildAmortizationSchedule(
      expense.totalAmount!,
      expense.numInstallments!,
      expense.interestRate ?? 0,
      expense.interestType ?? 'none',
      expense.startDate!,
    );
    const existingByNumber = new Map(
      (expense.paymentSchedule ?? []).map((row) => [
        row.installmentNumber,
        row,
      ]),
    );

    return newSchedule.map((row) => {
      const existing = existingByNumber.get(row.installmentNumber);
      return existing?.paidAt ? existing : row;
    });
  }

  async softDelete(id: string, userId: string): Promise<AnyExpenseDocument> {
    const expense = await this.findOneForUser(id, userId);
    expense.deletedAt = new Date();
    const saved = await expense.save();
    this.realtimeGateway.emitExpenseDeleted(userId, id);
    return saved;
  }

  async payInstallment(
    id: string,
    userId: string,
    installmentNumber: number,
    dto: PayInstallmentDto,
  ): Promise<AnyExpenseDocument> {
    const expense = await this.findOneForUser(id, userId);
    if (expense.type !== 'installment') {
      throw new BadRequestException('Expense is not an installment expense');
    }
    const row = expense.paymentSchedule?.find(
      (r) => r.installmentNumber === installmentNumber,
    );
    if (!row) throw new NotFoundException('Installment not found');

    row.paidAt = new Date();
    row.paidAmount = dto.paidAmount ?? row.totalDue;
    const saved = await expense.save();
    this.realtimeGateway.emitInstallmentPaid(userId, saved);
    return saved;
  }

  /**
   * Advances a recurring expense's schedule using the shared recurrence
   * engine (`@finance-tracker/finance-utils`), catching up if multiple
   * cycles have elapsed since the last run.
   */
  private advanceRecurringExpense(expense: AnyExpenseDocument): void {
    const now = new Date();
    let nextDueDate = expense.nextDueDate!;
    let iterations = 0;

    while (nextDueDate.getTime() <= now.getTime() && iterations < 1000) {
      expense.lastPaidDate = nextDueDate;
      nextDueDate = computeNextDueDate(nextDueDate, expense.frequency!);
      iterations += 1;

      if (
        expense.endDate &&
        nextDueDate.getTime() > expense.endDate.getTime()
      ) {
        expense.isActive = false;
        break;
      }
    }

    expense.nextDueDate = nextDueDate;
    expense.date = nextDueDate;
  }

  /** Manually record a recurring expense's occurrence as paid. */
  async payRecurringOccurrence(
    id: string,
    userId: string,
  ): Promise<AnyExpenseDocument> {
    const expense = await this.findOneForUser(id, userId);
    if (expense.type !== 'recurring') {
      throw new BadRequestException('Expense is not a recurring expense');
    }
    this.advanceRecurringExpense(expense);
    const saved = await expense.save();
    this.realtimeGateway.emitExpenseUpdated(userId, saved);
    return saved;
  }

  /** Cron entry point — advances every due, active recurring expense. */
  async processDueRecurringExpenses(): Promise<number> {
    const due = await this.expenseModel
      .find({
        type: 'recurring',
        isActive: true,
        deletedAt: { $exists: false },
        nextDueDate: { $lte: new Date() },
      })
      .exec();

    for (const expense of due as AnyExpenseDocument[]) {
      this.advanceRecurringExpense(expense);
      const saved = await expense.save();
      this.realtimeGateway.emitExpenseUpdated(saved.userId, saved);
    }

    return due.length;
  }

  async findUpcomingRecurring(
    userId: string,
    withinDays = 7,
  ): Promise<Array<AnyExpenseDocument & { daysUntilDue: number }>> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + withinDays);

    const upcoming = await this.expenseModel
      .find({
        userId,
        type: 'recurring',
        isActive: true,
        deletedAt: { $exists: false },
        nextDueDate: { $lte: cutoff },
      })
      .sort({ nextDueDate: 1 })
      .exec();

    return (upcoming as AnyExpenseDocument[]).map((expense) => {
      const plain = expense as AnyExpenseDocument & { daysUntilDue: number };
      plain.daysUntilDue = daysUntilDue(expense.nextDueDate!);
      return plain;
    });
  }
}
