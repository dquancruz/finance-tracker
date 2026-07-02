import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from './schemas/notification.schema';

type MockDoc = {
  _id: string;
  userId: string;
  read: boolean;
  readAt?: Date;
  save: jest.Mock;
} & Record<string, unknown>;

function buildDoc(overrides: Partial<MockDoc> = {}): MockDoc {
  const doc: MockDoc = {
    _id: 'notif-1',
    userId: 'user-1',
    type: 'system',
    title: 'Title',
    message: 'Message',
    read: false,
    save: jest.fn(),
    ...overrides,
  };
  doc.save.mockImplementation(() => Promise.resolve(doc));
  return doc;
}

describe('NotificationsService', () => {
  let service: NotificationsService;
  let modelMock: {
    find: jest.Mock;
    findOne: jest.Mock;
    countDocuments: jest.Mock;
    updateMany: jest.Mock;
  };

  beforeEach(async () => {
    modelMock = {
      find: jest.fn(),
      findOne: jest.fn(),
      countDocuments: jest.fn(),
      updateMany: jest.fn(),
    };

    const constructorMock = jest.fn().mockImplementation((data: object) => {
      return buildDoc(data);
    });
    Object.assign(constructorMock, modelMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getModelToken(Notification.name),
          useValue: constructorMock,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('create', () => {
    it('persists a notification for the given user', async () => {
      const result = await service.create('user-1', {
        type: 'budget_overrun',
        title: 'Over budget',
        message: 'You went over budget',
      });

      expect(result.userId).toBe('user-1');
      expect((result as unknown as MockDoc).save).toHaveBeenCalled();
    });
  });

  describe('findAllForUser', () => {
    it('queries non-deleted notifications sorted by newest first', async () => {
      const exec = jest.fn().mockResolvedValue([buildDoc()]);
      const limit = jest.fn().mockReturnValue({ exec });
      const sort = jest.fn().mockReturnValue({ limit });
      modelMock.find.mockReturnValue({ sort });

      const result = await service.findAllForUser('user-1');

      expect(modelMock.find).toHaveBeenCalledWith({
        userId: 'user-1',
        deletedAt: { $exists: false },
      });
      expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toHaveLength(1);
    });
  });

  describe('countUnread', () => {
    it('counts unread, non-deleted notifications', async () => {
      modelMock.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(4),
      });

      const count = await service.countUnread('user-1');

      expect(modelMock.countDocuments).toHaveBeenCalledWith({
        userId: 'user-1',
        read: false,
        deletedAt: { $exists: false },
      });
      expect(count).toBe(4);
    });
  });

  describe('markAsRead', () => {
    it('throws NotFoundException when missing', async () => {
      modelMock.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.markAsRead('x', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('marks a notification as read', async () => {
      const doc = buildDoc();
      modelMock.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(doc),
      });

      const result = await service.markAsRead('notif-1', 'user-1');

      expect(result.read).toBe(true);
      expect(result.readAt).toBeInstanceOf(Date);
      expect(doc.save).toHaveBeenCalled();
    });
  });

  describe('markAllAsRead', () => {
    it('bulk-updates every unread notification for the user', async () => {
      modelMock.updateMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 3 }),
      });

      const modified = await service.markAllAsRead('user-1');

      const [filter, update] = modelMock.updateMany.mock.calls[0] as [
        Record<string, unknown>,
        { $set: { read: boolean; readAt: Date } },
      ];
      expect(filter).toEqual({
        userId: 'user-1',
        read: false,
        deletedAt: { $exists: false },
      });
      expect(update.$set.read).toBe(true);
      expect(update.$set.readAt).toBeInstanceOf(Date);
      expect(modified).toBe(3);
    });
  });

  describe('existsRecent', () => {
    it('returns true when a matching recent notification exists', async () => {
      modelMock.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(buildDoc()),
      });

      const exists = await service.existsRecent('user-1', 'budget:cat-1', 24);

      expect(exists).toBe(true);
    });

    it('returns false when nothing matches', async () => {
      modelMock.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const exists = await service.existsRecent('user-1', 'budget:cat-1', 24);

      expect(exists).toBe(false);
    });
  });
});
