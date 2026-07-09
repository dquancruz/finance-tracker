import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import type { NotificationType } from '@finance-tracker/shared';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  userId: string;

  @Prop({
    type: String,
    required: true,
    enum: ['budget_overrun', 'payment_due', 'system'],
  })
  type: NotificationType;

  @Prop({ required: true, trim: true, maxlength: 120 })
  title: string;

  @Prop({ required: true, trim: true, maxlength: 500 })
  message: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;

  /**
   * Idempotency key for cron-generated notifications (e.g.
   * `budget:<categoryId>:<monthKey>` or `payment:<expenseId>:<dueDate>`).
   * Combined with the unique index below, this guarantees at most one
   * notification per (userId, dedupeKey) is ever persisted, even if two
   * processor runs race each other. Manually-created notifications (e.g.
   * `type: 'system'`) can omit it.
   */
  @Prop()
  dedupeKey?: string;

  @Prop({ default: false })
  read: boolean;

  @Prop()
  readAt?: Date;

  @Prop()
  deletedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ userId: 1, deletedAt: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1, deletedAt: 1 });

// Atomic dedupe guard: only one notification per (userId, dedupeKey) can
// ever exist. Partial so notifications without a dedupeKey (manual/system)
// aren't constrained by it.
NotificationSchema.index(
  { userId: 1, dedupeKey: 1 },
  { unique: true, partialFilterExpression: { dedupeKey: { $type: 'string' } } },
);
