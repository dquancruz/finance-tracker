import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { NotificationType } from '@finance-tracker/shared';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {}

  async create(
    userId: string,
    input: CreateNotificationInput,
  ): Promise<NotificationDocument> {
    const notification = new this.notificationModel({ ...input, userId });
    return notification.save();
  }

  async findAllForUser(
    userId: string,
    limit = 50,
  ): Promise<NotificationDocument[]> {
    return this.notificationModel
      .find({ userId, deletedAt: { $exists: false } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async countUnread(userId: string): Promise<number> {
    return this.notificationModel
      .countDocuments({ userId, read: false, deletedAt: { $exists: false } })
      .exec();
  }

  async markAsRead(id: string, userId: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel
      .findOne({ _id: id, userId, deletedAt: { $exists: false } })
      .exec();
    if (!notification) throw new NotFoundException('Notification not found');

    notification.read = true;
    notification.readAt = new Date();
    return notification.save();
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationModel
      .updateMany(
        { userId, read: false, deletedAt: { $exists: false } },
        { $set: { read: true, readAt: new Date() } },
      )
      .exec();
    return result.modifiedCount;
  }

  /**
   * Dedupe guard for the notification processor — avoids re-alerting on
   * every cron tick for the same budget/payment by keying on
   * `metadata.dedupeKey` and only looking within a recent time window.
   */
  async existsRecent(
    userId: string,
    dedupeKey: string,
    withinHours: number,
  ): Promise<boolean> {
    const since = new Date(Date.now() - withinHours * 60 * 60 * 1000);
    const existing = await this.notificationModel
      .findOne({
        userId,
        'metadata.dedupeKey': dedupeKey,
        createdAt: { $gte: since },
        deletedAt: { $exists: false },
      })
      .exec();
    return Boolean(existing);
  }
}
