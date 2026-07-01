'use client';

import type { ICategory } from '@finance-tracker/shared';
import { useCategories } from '@/lib/hooks/use-categories';

interface CategorySelectProps {
  id: string;
  value: string;
  onChange: (categoryId: string) => void;
  required?: boolean;
}

export function CategorySelect({
  id,
  value,
  onChange,
  required,
}: CategorySelectProps) {
  const { data: categories, isLoading } = useCategories();

  return (
    <select
      id={id}
      value={value}
      required={required}
      onChange={(e) => onChange(e.target.value)}
      disabled={isLoading}
      className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
    >
      <option value="" disabled>
        {isLoading ? 'Loading categories…' : 'Select a category'}
      </option>
      {(categories ?? []).map((category: ICategory) => (
        <option key={category._id} value={category._id}>
          {category.icon} {category.name}
        </option>
      ))}
    </select>
  );
}
