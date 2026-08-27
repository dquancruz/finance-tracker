import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from '../categories/categories.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { ExpensesService } from './expenses.service';
import { Expense } from './schemas/expense.schema';

interface MockDoc {
  save: jest.Mock;
  [key: string]: unknown;
}

function buildDoc(data: Record<string, unknown>): MockDoc {
  const doc: MockDoc = { ...data, save: jest.fn() };
  doc.save.mockImplementation(() => Promise.resolve(doc));
  return doc;
}

function buildDiscriminatorCtor() {
  return jest.fn().mockImplementation((data: Record<string, unknown>) => {
    return buildDoc(data);
  });
}

describe('ExpensesService', () => {
  let service: ExpensesService;
  let modelMock: {
    find: jest.Mock;
    findOne: jest.Mock;
    countDocuments: jest.Mock;
    discriminators: Record<string, jest.Mock>;
  };
  let findCategoryForUser: jest.Mock;

  beforeEach(async () => {
    modelMock = {
      find: jest.fn(),
      findOne: jest.fn(),
      countDocuments: jest.fn(),
      discriminators: {
        simple: buildDiscriminatorCtor(),
        recurring: buildDiscriminatorCtor(),
        installment: buildDiscriminatorCtor(),
      },
    };
    findCategoryForUser = jest.fn().mockResolvedValue({ _id: 'cat-1' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        { provide: getModelToken(Expense.name), useValue: modelMock },
        {
          provide: CategoriesService,
          useValue: { findOneForUser: findCategoryForUser },
        },
        {
          provide: RealtimeGateway,
          useValue: {
            emitExpenseCreated: jest.fn(),
            emitExpenseUpdated: jest.fn(),
            emitExpenseDeleted: jest.fn(),
            emitInstallmentPaid: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
  });

  describe('create', () => {
    it('creates a simple expense via the "simple" discriminator', async () => {
      const doc = await service.create('user-1', {
        type: 'simple',
        categoryId: 'cat-1',
        amount: 42,
        date: '2026-01-15',
      });

      expect(modelMock.discriminators.simple).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1', amount: 42 }),
      );
      expect(findCategoryForUser).toHaveBeenCalledWith('cat-1', 'user-1');
      expect((doc as unknown as MockDoc).save).toHaveBeenCalled();
    });

    it('does not persist when the category is not visible to the user', async () => {
      findCategoryForUser.mockRejectedValue(
        new NotFoundException('Category not found'),
      );

      await expect(
        service.create('user-1', {
          type: 'simple',
          categoryId: 'foreign-cat',
          amount: 10,
          date: '2026-01-01',
        }),
      ).rejects.toThrow(NotFoundException);

      expect(modelMock.discriminators.simple).not.toHaveBeenCalled();
    });

    it('creates a recurring expense with nextDueDate seeded from startDate', async () => {
      const doc = await service.create('user-1', {
        type: 'recurring',
        categoryId: 'cat-1',
        description: 'Netflix',
        amount: 15,
        frequency: 'monthly',
        startDate: '2026-01-01',
      });

      expect(modelMock.discriminators.recurring).toHaveBeenCalledWith(
        expect.objectContaining({
          nextDueDate: new Date('2026-01-01'),
          isActive: true,
        }),
      );
      expect(doc.nextDueDate).toEqual(new Date('2026-01-01'));
    });

    it('creates an installment expense with an amortization schedule', async () => {
      const doc = await service.create('user-1', {
        type: 'installment',
        categoryId: 'cat-1',
        description: 'Laptop',
        totalAmount: 1200,
        numInstallments: 12,
        interestType: 'none',
        startDate: '2026-01-01',
      });

      expect(doc.paymentSchedule).toHaveLength(12);
      expect(doc.installmentAmount).toBeCloseTo(100);
    });

    it('throws when the discriminator for a type is not registered', async () => {
      modelMock.discriminators = {};
      await expect(
        service.create('user-1', {
          type: 'simple',
          categoryId: 'cat-1',
          amount: 10,
          date: '2026-01-01',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAllForUser', () => {
    it('applies filters, sort, and pagination', async () => {
      const exec1 = jest.fn().mockResolvedValue([]);
      const limitFn = jest.fn().mockReturnValue({ exec: exec1 });
      const skipFn = jest.fn().mockReturnValue({ limit: limitFn });
      const sortFn = jest.fn().mockReturnValue({ skip: skipFn });
      modelMock.find.mockReturnValue({ sort: sortFn });
      modelMock.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(3),
      });

      const result = await service.findAllForUser('user-1', {
        type: 'simple',
        categoryId: 'cat-1',
        page: 2,
        limit: 10,
        sortBy: 'amount',
        sortOrder: 'asc',
      });

      expect(modelMock.find).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          type: 'simple',
          categoryId: 'cat-1',
        }),
      );
      expect(sortFn).toHaveBeenCalledWith({ amount: 1 });
      expect(skipFn).toHaveBeenCalledWith(10);
      expect(limitFn).toHaveBeenCalledWith(10);
      expect(result.total).toBe(3);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findOneForUser', () => {
    it('throws NotFoundException when missing', async () => {
      modelMock.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      await expect(service.findOneForUser('x', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('does not persist when the new category is not visible to the user', async () => {
      const doc = buildDoc({ type: 'simple', categoryId: 'cat-1' });
      modelMock.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      });
      findCategoryForUser.mockRejectedValue(
        new NotFoundException('Category not found'),
      );

      await expect(
        service.update('exp-1', 'user-1', { categoryId: 'foreign-cat' }),
      ).rejects.toThrow(NotFoundException);

      expect(doc.save).not.toHaveBeenCalled();
    });
  });

  describe('payInstallment', () => {
    it('marks the given installment as paid', async () => {
      const doc = buildDoc({
        type: 'installment',
        paymentSchedule: [
          { installmentNumber: 1, totalDue: 100 },
          { installmentNumber: 2, totalDue: 100 },
        ],
      });
      modelMock.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      });

      const result = await service.payInstallment('id', 'user-1', 1, {});
      const row = (
        result.paymentSchedule as Array<{
          installmentNumber: number;
          paidAt?: Date;
          paidAmount?: number;
        }>
      ).find((r) => r.installmentNumber === 1)!;

      expect(row.paidAt).toBeInstanceOf(Date);
      expect(row.paidAmount).toBe(100);
    });

    it('throws BadRequestException for non-installment expenses', async () => {
      const doc = buildDoc({ type: 'simple' });
      modelMock.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      });

      await expect(
        service.payInstallment('id', 'user-1', 1, {}),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('payRecurringOccurrence / processDueRecurringExpenses', () => {
    // Use the local-time Date constructor (year, month, day) — new
    // Date('YYYY-MM-DD') parses as UTC midnight and can shift a day when the
    // local timezone offset is negative, same pitfall documented in
    // finance-utils/src/recurrence.test.ts.
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date(2026, 0, 15));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('advances nextDueDate using the shared recurrence engine', async () => {
      const doc = buildDoc({
        type: 'recurring',
        frequency: 'monthly',
        nextDueDate: new Date(2026, 0, 1),
      });
      modelMock.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      });

      const result = await service.payRecurringOccurrence('id', 'user-1');

      expect(result.lastPaidDate).toEqual(new Date(2026, 0, 1));
      expect((result.nextDueDate as Date).getMonth()).toBe(1); // February
    });

    it('deactivates a recurring expense once past its endDate', async () => {
      const doc = buildDoc({
        type: 'recurring',
        frequency: 'monthly',
        nextDueDate: new Date(2020, 0, 1),
        endDate: new Date(2020, 0, 15),
      });
      modelMock.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      });

      const result = await service.payRecurringOccurrence('id', 'user-1');

      expect(result.isActive).toBe(false);
    });

    it('processes every due recurring expense in one pass', async () => {
      const due = [
        buildDoc({
          type: 'recurring',
          frequency: 'monthly',
          nextDueDate: new Date(2020, 0, 1),
        }),
        buildDoc({
          type: 'recurring',
          frequency: 'weekly',
          nextDueDate: new Date(2020, 0, 1),
        }),
      ];
      modelMock.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(due),
      });

      const count = await service.processDueRecurringExpenses();

      expect(count).toBe(2);
      expect(due[0].save).toHaveBeenCalled();
      expect(due[1].save).toHaveBeenCalled();
    });
  });
});
