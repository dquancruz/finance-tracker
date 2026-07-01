import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import type { ExpenseType } from '@finance-tracker/shared';
import {
  CreateExpenseDto,
  CreateInstallmentExpenseDto,
  CreateRecurringExpenseDto,
  CreateSimpleExpenseDto,
} from './create-expense.dto';
import {
  UpdateExpenseDto,
  UpdateInstallmentExpenseDto,
  UpdateRecurringExpenseDto,
  UpdateSimpleExpenseDto,
} from './update-expense.dto';

function assertValid<T extends object>(instance: T): T {
  const errors = validateSync(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
  if (errors.length > 0) {
    const messages = errors.flatMap((e) => Object.values(e.constraints ?? {}));
    throw new BadRequestException(messages);
  }
  return instance;
}

const CREATE_DTO_BY_TYPE: Record<ExpenseType, new () => CreateExpenseDto> = {
  simple: CreateSimpleExpenseDto,
  recurring: CreateRecurringExpenseDto,
  installment: CreateInstallmentExpenseDto,
};

const UPDATE_DTO_BY_TYPE: Record<ExpenseType, new () => UpdateExpenseDto> = {
  simple: UpdateSimpleExpenseDto,
  recurring: UpdateRecurringExpenseDto,
  installment: UpdateInstallmentExpenseDto,
};

/** Validates the raw request body against the DTO matching its `type`. */
export function validateCreateExpenseDto(body: unknown): CreateExpenseDto {
  const type = (body as { type?: unknown })?.type;
  if (typeof type !== 'string' || !(type in CREATE_DTO_BY_TYPE)) {
    throw new BadRequestException(
      'type must be one of: simple, recurring, installment',
    );
  }
  const dtoClass = CREATE_DTO_BY_TYPE[type as ExpenseType];
  const instance = plainToInstance(dtoClass, body, {
    excludeExtraneousValues: false,
  });
  return assertValid(instance);
}

/** Validates an update body against the DTO matching the expense's current type. */
export function validateUpdateExpenseDto(
  body: unknown,
  currentType: ExpenseType,
): UpdateExpenseDto {
  const dtoClass = UPDATE_DTO_BY_TYPE[currentType];
  const instance = plainToInstance(dtoClass, body, {
    excludeExtraneousValues: false,
  });
  return assertValid(instance);
}
