import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { BudgetPeriod } from '@finance-tracker/shared';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category {
  // `null` = system/global category available to every user.
  @Prop({ type: String, default: null })
  userId: string | null;

  @Prop({ required: true, trim: true, maxlength: 40 })
  name: string;

  @Prop({ required: true })
  icon: string;

  @Prop({ required: true })
  color: string;

  @Prop({ min: 0 })
  budgetLimit?: number;

  @Prop({ type: String, enum: ['monthly', 'yearly'] })
  budgetPeriod?: BudgetPeriod;

  @Prop({ default: false })
  isSystem: boolean;

  @Prop()
  deletedAt?: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.index({ userId: 1, deletedAt: 1 });
