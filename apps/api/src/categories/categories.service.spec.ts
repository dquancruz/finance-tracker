import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { Category } from './schemas/category.schema';
import { CategoryBudgetOverride } from './schemas/category-budget-override.schema';

type MockDoc = {
  _id: string;
  userId: string | null;
  isSystem: boolean;
  deletedAt?: Date;
  save: jest.Mock;
} & Record<string, unknown>;

function buildDoc(overrides: Partial<MockDoc> = {}): MockDoc {
  const doc: MockDoc = {
    _id: 'cat-1',
    userId: 'user-1',
    isSystem: false,
    name: 'Groceries',
    icon: '🛒',
    color: '#00FF00',
    save: jest.fn(),
    ...overrides,
  };
  doc.save.mockImplementation(() => Promise.resolve(doc));
  return doc;
}

describe('CategoriesService', () => {
  let service: CategoriesService;
  let modelMock: {
    find: jest.Mock;
    findOne: jest.Mock;
    updateOne: jest.Mock;
  };
  let overrideModelMock: {
    find: jest.Mock;
    findOne: jest.Mock;
    findOneAndUpdate: jest.Mock;
  };

  beforeEach(async () => {
    modelMock = {
      find: jest.fn(),
      findOne: jest.fn(),
      updateOne: jest.fn().mockResolvedValue({}),
    };
    overrideModelMock = {
      find: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
      findOne: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      findOneAndUpdate: jest.fn(),
    };

    const constructorMock = jest.fn().mockImplementation((data: object) => {
      return buildDoc(data);
    });
    Object.assign(constructorMock, modelMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getModelToken(Category.name), useValue: constructorMock },
        {
          provide: getModelToken(CategoryBudgetOverride.name),
          useValue: overrideModelMock,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  describe('findAllForUser', () => {
    it('queries system categories plus the user own categories', async () => {
      const exec = jest.fn().mockResolvedValue([buildDoc()]);
      const sort = jest.fn().mockReturnValue({ exec });
      modelMock.find.mockReturnValue({ sort });

      const result = await service.findAllForUser('user-1');

      expect(modelMock.find).toHaveBeenCalledWith({
        deletedAt: { $exists: false },
        $or: [{ userId: null }, { userId: 'user-1' }],
      });
      expect(result).toHaveLength(1);
    });

    it('merges a user budget override onto a system category', async () => {
      const systemCat = buildDoc({
        _id: 'cat-sys',
        isSystem: true,
        userId: null,
      });
      const exec = jest.fn().mockResolvedValue([systemCat]);
      const sort = jest.fn().mockReturnValue({ exec });
      modelMock.find.mockReturnValue({ sort });
      overrideModelMock.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            categoryId: 'cat-sys',
            budgetLimit: 300,
            budgetPeriod: 'monthly',
          },
        ]),
      });

      const [result] = await service.findAllForUser('user-1');

      expect(result.budgetLimit).toBe(300);
      expect(result.budgetPeriod).toBe('monthly');
    });
  });

  describe('findOneForUser', () => {
    it('throws NotFoundException when nothing matches', async () => {
      const exec = jest.fn().mockResolvedValue(null);
      modelMock.findOne.mockReturnValue({ exec });

      await expect(service.findOneForUser('missing', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('forbids editing a system category', async () => {
      const systemDoc = buildDoc({ isSystem: true, userId: null });
      const exec = jest.fn().mockResolvedValue(systemDoc);
      modelMock.findOne.mockReturnValue({ exec });

      await expect(
        service.update('cat-1', 'user-1', { name: 'New name' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('applies changes to an owned category', async () => {
      const owned = buildDoc();
      const exec = jest.fn().mockResolvedValue(owned);
      modelMock.findOne.mockReturnValue({ exec });

      const result = await service.update('cat-1', 'user-1', {
        budgetLimit: 500,
      });

      expect(owned.save).toHaveBeenCalled();
      expect(result.budgetLimit).toBe(500);
    });

    it('upserts a per-user override for a budget-only update on a system category', async () => {
      const systemDoc = buildDoc({ isSystem: true, userId: null });
      const exec = jest.fn().mockResolvedValue(systemDoc);
      modelMock.findOne.mockReturnValue({ exec });
      overrideModelMock.findOneAndUpdate.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ budgetLimit: 200, budgetPeriod: 'yearly' }),
      });

      const result = await service.update('cat-1', 'user-1', {
        budgetLimit: 200,
        budgetPeriod: 'yearly',
      });

      expect(overrideModelMock.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: 'user-1', categoryId: 'cat-1' },
        { $set: { budgetLimit: 200, budgetPeriod: 'yearly' } },
        { upsert: true, new: true },
      );
      expect(systemDoc.save).not.toHaveBeenCalled();
      expect(result.budgetLimit).toBe(200);
      expect(result.budgetPeriod).toBe('yearly');
    });
  });

  describe('softDelete', () => {
    it('sets deletedAt on an owned category', async () => {
      const owned = buildDoc();
      const exec = jest.fn().mockResolvedValue(owned);
      modelMock.findOne.mockReturnValue({ exec });

      const result = await service.softDelete('cat-1', 'user-1');

      expect(result.deletedAt).toBeInstanceOf(Date);
    });
  });
});
