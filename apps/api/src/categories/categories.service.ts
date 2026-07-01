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
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService implements OnModuleInit {
  constructor(
    @InjectModel(Category.name)
    private readonly categoryModel: Model<CategoryDocument>,
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

  /** System categories plus the user's own custom categories. */
  async findAllForUser(userId: string): Promise<CategoryDocument[]> {
    return this.categoryModel
      .find({
        deletedAt: { $exists: false },
        $or: [{ userId: null }, { userId }],
      })
      .sort({ isSystem: -1, name: 1 })
      .exec();
  }

  async findOneForUser(id: string, userId: string): Promise<CategoryDocument> {
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
    const category = await this.findOneForUser(id, userId);
    if (category.isSystem || category.userId !== userId) {
      throw new ForbiddenException('Cannot modify a system category');
    }
    Object.assign(category, dto);
    return category.save();
  }

  async softDelete(id: string, userId: string): Promise<CategoryDocument> {
    const category = await this.findOneForUser(id, userId);
    if (category.isSystem || category.userId !== userId) {
      throw new ForbiddenException('Cannot delete a system category');
    }
    category.deletedAt = new Date();
    return category.save();
  }
}
