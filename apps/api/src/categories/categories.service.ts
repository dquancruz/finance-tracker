import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SYSTEM_CATEGORIES } from '@finance-tracker/shared';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import {
  CategoryBudgetOverride,
  CategoryBudgetOverrideDocument,
} from './schemas/category-budget-override.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

const BUDGET_FIELDS = [
  'budgetLimit',
  'budgetPeriod',
  'budgetCurrency',
] as const;

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(CategoryBudgetOverride.name)
    private readonly overrideModel: Model<CategoryBudgetOverrideDocument>,
  ) {}

  /** Idempotently seed the global system categories on boot. */
  async onModuleInit(): Promise<void> {
    await this.seedSystemCategories();
  }

  async seedSystemCategories(): Promise<void> {
    for (const seed of SYSTEM_CATEGORIES) {
      await this.categoryModel.updateOne(
        { userId: null, name: seed.name },
        { $setOnInsert: { ...seed, userId: null, isSystem: true } },
        { upsert: true },
      );
    }
  }

  /** Fetches a category exactly as stored, without merging in a budget override. */
  private async findRawForUser(
    id: string,
    userId: string,
  ): Promise<CategoryDocument> {
    const category = await this.categoryModel
      .findOne({
        _id: id,
        deletedAt: { $exists: false },
        $or: [{ userId: null }, { userId }],
      })
      .exec();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  /**
   * Applies a user's budget override onto an in-memory category document.
   * Never persisted here — the shared system category document is never
   * written to, only the response the caller sees.
   */
  private applyOverride(
    category: CategoryDocument,
    override: CategoryBudgetOverrideDocument | null,
  ): CategoryDocument {
    if (override) {
      category.budgetLimit = override.budgetLimit;
      category.budgetPeriod = override.budgetPeriod;
      category.budgetCurrency = override.budgetCurrency;
    }
    return category;
  }

  /** System categories plus the user's own custom categories. */
  async findAllForUser(userId: string): Promise<CategoryDocument[]> {
    const categories = await this.categoryModel
      .find({
        deletedAt: { $exists: false },
        $or: [{ userId: null }, { userId }],
      })
      .sort({ isSystem: -1, name: 1 })
      .exec();

    const overrides = await this.overrideModel.find({ userId }).exec();
    const overrideByCategoryId = new Map(
      overrides.map((o) => [o.categoryId, o]),
    );

    for (const category of categories) {
      if (category.isSystem) {
        this.applyOverride(
          category,
          overrideByCategoryId.get(category._id.toString()) ?? null,
        );
      }
    }
    return categories;
  }

  async findOneForUser(id: string, userId: string): Promise<CategoryDocument> {
    const category = await this.findRawForUser(id, userId);
    if (category.isSystem) {
      const override = await this.overrideModel
        .findOne({ userId, categoryId: id })
        .exec();
      this.applyOverride(category, override);
    }
    return category;
  }

  async create(
    userId: string,
    dto: CreateCategoryDto,
  ): Promise<CategoryDocument> {
    const category = new this.categoryModel({
      ...dto,
      userId,
      isSystem: false,
    });
    return category.save();
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateCategoryDto,
  ): Promise<CategoryDocument> {
    const category = await this.findRawForUser(id, userId);

    if (category.isSystem) {
      const hasNonBudgetField = Object.keys(dto).some(
        (key) => !(BUDGET_FIELDS as readonly string[]).includes(key),
      );
      if (hasNonBudgetField) {
        throw new ForbiddenException('Cannot modify a system category');
      }
      const override = await this.overrideModel
        .findOneAndUpdate(
          { userId, categoryId: id },
          {
            $set: {
              budgetLimit: dto.budgetLimit,
              budgetPeriod: dto.budgetLimit ? dto.budgetPeriod : undefined,
              budgetCurrency: dto.budgetLimit ? dto.budgetCurrency : undefined,
            },
          },
          { upsert: true, new: true },
        )
        .exec();
      return this.applyOverride(category, override);
    }

    if (category.userId !== userId) {
      throw new ForbiddenException('Cannot modify a system category');
    }
    Object.assign(category, dto);
    return category.save();
  }

  async softDelete(id: string, userId: string): Promise<CategoryDocument> {
    const category = await this.findRawForUser(id, userId);
    if (category.isSystem || category.userId !== userId) {
      throw new ForbiddenException('Cannot delete a system category');
    }
    category.deletedAt = new Date();
    return category.save();
  }
}
