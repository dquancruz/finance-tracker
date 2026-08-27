import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExpensesService } from './expenses.service';
import {
  QueryExpenseDto,
  UpcomingRecurringQueryDto,
} from './dto/query-expense.dto';
import { PayInstallmentDto } from './dto/pay-installment.dto';
import {
  validateCreateExpenseDto,
  validateUpdateExpenseDto,
} from './dto/validate-expense-dto';

@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  findAll(
    @Query() query: QueryExpenseDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.expensesService.findAllForUser(userId, query);
  }

  @Get('recurring/upcoming')
  findUpcomingRecurring(
    @CurrentUser('userId') userId: string,
    @Query() query: UpcomingRecurringQueryDto,
  ) {
    return this.expensesService.findUpcomingRecurring(userId, query.withinDays);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.expensesService.findOneForUser(id, userId);
  }

  @Post()
  create(@Body() body: unknown, @CurrentUser('userId') userId: string) {
    const dto = validateCreateExpenseDto(body);
    return this.expensesService.create(userId, dto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser('userId') userId: string,
  ) {
    const existing = await this.expensesService.findOneForUser(id, userId);
    const dto = validateUpdateExpenseDto(body, existing.type);
    return this.expensesService.update(id, userId, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.expensesService.softDelete(id, userId);
  }

  @Post(':id/recurring/pay')
  payRecurringOccurrence(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.expensesService.payRecurringOccurrence(id, userId);
  }

  @Post(':id/installments/:installmentNumber/pay')
  payInstallment(
    @Param('id') id: string,
    @Param('installmentNumber', ParseIntPipe) installmentNumber: number,
    @Body() dto: PayInstallmentDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.expensesService.payInstallment(
      id,
      userId,
      installmentNumber,
      dto,
    );
  }
}
