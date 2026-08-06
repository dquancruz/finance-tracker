'use client';

import { useCategories } from '@/lib/hooks/use-categories';
import { CategoryForm } from './_components/category-form';
import { CategoryList } from './_components/category-list';

export default function CategoriesPage() {
  const { data: categories, isLoading, isError } = useCategories();

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Categories
      </h1>
      <p className="mt-2 text-zinc-500 dark:text-zinc-400">
        Manage your spending categories and their budget limits.
      </p>

      <div className="mt-6">
        <CategoryForm />
      </div>

      {isLoading && (
        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">Loading categories…</p>
      )}
      {isError && (
        <p role="alert" className="mt-8 text-sm text-red-600 dark:text-red-400">
          Could not load categories. Please try again.
        </p>
      )}
      {categories && <CategoryList categories={categories} />}
    </div>
  );
}
