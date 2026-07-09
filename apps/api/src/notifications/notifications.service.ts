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

export interface CreateDedupedNotificationInput extends CreateNotificationInput {
  /** Idempotency key — see `Notification.dedupeKey` for format conventions. */
  dedupeKey: string;
}

export interface DedupedNotificationResult {
  notification: NotificationDocument;
  /** False when a notification for this (userId, dedupeKey) already existed. */
  created: boolean;
}

/** MongoDB duplicate-key error code. */
const MONGO_DUPLICATE_KEY_ERROR_CODE = 11000;

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: number }).code === MONGO_DUPLICATE_KEY_ERROR_CODE
  );
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
   * Atomic dedupe guard for the notification processor. Replaces the old
   * check-then-insert `existsRecent()` pattern (race-prone when cron runs
   * overlap) with a single `findOneAndUpdate({ upsert: true })` guarded by
   * the unique `(userId, dedupeKey)` index on the schema — MongoDB itself
   * guarantees only one caller ever wins the insert for a given key.
   *
   * If two callers race anyway (both attempt the upsert before either's
   * insert is visible to the other), the loser gets a duplicate-key error
   * from Mongo; we catch it and re-fetch the winning document so callers
   * always get a notification back, with `created: false` telling them not
   * to re-emit a real-time push.
   */
  async createDeduped(
    userId: string,
    input: CreateDedupedNotificationInput,
  ): Promise<DedupedNotificationResult> {
    const { dedupeKey, ...rest } = input;

    try {
      const result = await this.notificationModel
        .findOneAndUpdate(
          { userId, dedupeKey },
          { $setOnInsert: { ...rest, userId, dedupeKey } },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
            includeResultMetadata: true,
          },
        )
        .exec();

      if (!result.value) {
        throw new Error('findOneAndUpdate upsert returned no document');
      }

      return {
        notification: result.value,
        created: !result.lastErrorObject?.updatedExisting,
      };
    } catch (error) {
      if (isDuplicateKeyError(error)) {
        const existing = await this.notificationModel
          .findOne({ userId, dedupeKey })
          .exec();
        if (existing) {
          return { notification: existing, created: false };
        }
      }
      throw error;
    }
  }
}
