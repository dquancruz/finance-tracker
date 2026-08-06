import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { BudgetPeriod } from '@finance-tracker/shared';

export type CategoryBudgetOverrideDocument =
  HydratedDocument<CategoryBudgetOverride>;

/**
 * Per-user budget override for a system category.
 *
 * System categories (`Category.userId === null`) are a single shared
 * document seeded once and read by every user, so a budget can't be stored
 * directly on them without leaking across accounts. This collection holds
 * one row per (userId, categoryId) so each user can set their own budget on
 * a shared category without touching the shared document at all.
 */
@Schema({ timestamps: true, collection: 'category_budget_overrides' })
export class CategoryBudgetOverride {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  categoryId: string;

  @Prop({ min: 0 })
  budgetLimit?: number;

  @Prop({ type: String, enum: ['monthly', 'yearly'] })
  budgetPeriod?: BudgetPeriod;
}

export const CategoryBudgetOverrideSchema = SchemaFactory.createForClass(
  CategoryBudgetOverride,
);

CategoryBudgetOverrideSchema.index(
  { userId: 1, categoryId: 1 },
  { unique: true },
);
