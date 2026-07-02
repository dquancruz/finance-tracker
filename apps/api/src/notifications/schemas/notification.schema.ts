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
