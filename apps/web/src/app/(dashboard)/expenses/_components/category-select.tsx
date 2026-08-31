'use client';

import type { ICategory } from '@finance-tracker/shared';
import { useId, useMemo, useRef, useState } from 'react';
import { useCategories } from '@/lib/hooks/use-categories';
import { useDropdownDismiss } from '@/lib/hooks/use-dropdown-dismiss';
import { useDropdownKeyboard } from '@/lib/hooks/use-dropdown-keyboard';

interface CategorySelectProps {
  id: string;
  value: string;
  onChange: (categoryId: string) => void;
  required?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
  className?: string;
}

function CategoryOptionLabel({
  category,
  showColor = true,
}: {
  category: Pick<ICategory, 'icon' | 'name' | 'color'>;
  showColor?: boolean;
}) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {showColor && (
        <span
          aria-hidden="true"
          className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-black/5 dark:ring-white/10"
          style={{ backgroundColor: category.color }}
        />
      )}
      <span aria-hidden="true">{category.icon}</span>
      <span className="truncate">{category.name}</span>
    </span>
  );
}

export function CategorySelect({
  id,
  value,
  onChange,
  required = false,
  allowEmpty = false,
  emptyLabel = 'All categories',
  className = '',
}: CategorySelectProps) {
  const { data: categories, isLoading } = useCategories();
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const errorId = useId();

  const selected = categories?.find((category) => category._id === value);
  const optionIds = useMemo(
    () => [
      ...(allowEmpty ? [''] : []),
      ...(categories ?? []).map((category) => category._id),
    ],
    [allowEmpty, categories],
  );

  const { activeIndex, handleKeyDown, resetIndex } = useDropdownKeyboard({
    itemCount: optionIds.length,
    enabled: open,
    onClose: () => setOpen(false),
    onSelect: (index) => {
      const categoryId = optionIds[index];
      if (categoryId !== undefined) selectCategory(categoryId);
    },
    getOptionLabel: (index) => {
      const categoryId = optionIds[index];
      if (allowEmpty && categoryId === '') return emptyLabel;
      const category = categories?.find((item) => item._id === categoryId);
      return category?.name ?? '';
    },
  });

  useDropdownDismiss(open, rootRef, () => setOpen(false));

  function selectCategory(categoryId: string) {
    onChange(categoryId);
    setTouched(true);
    setOpen(false);
  }

  const triggerLabel = isLoading
    ? 'Loading categories…'
    : selected
      ? selected.name
      : allowEmpty
        ? emptyLabel
        : 'Select a category';

  const showRequiredError = required && !value && !allowEmpty && touched;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-required={required || undefined}
        aria-invalid={showRequiredError || undefined}
        aria-describedby={showRequiredError ? errorId : undefined}
        disabled={isLoading}
        onBlur={() => setTouched(true)}
        onClick={() => {
          setOpen((current) => {
            if (!current) resetIndex();
            return !current;
          });
        }}
        onKeyDown={(event) => {
          if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
            event.preventDefault();
            setOpen(true);
            resetIndex();
            return;
          }
          handleKeyDown(event);
        }}
        className={`mt-1 flex w-full items-center justify-between gap-2 rounded-lg border bg-surface px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-zinc-800 ${
          showRequiredError
            ? 'border-red-300 dark:border-red-500/40'
            : 'border-zinc-300 dark:border-zinc-700'
        }`}
      >
        <span className="min-w-0">
          {selected ? (
            <CategoryOptionLabel category={selected} />
          ) : (
            <span className="text-zinc-500 dark:text-zinc-400">{triggerLabel}</span>
          )}
        </span>
        <svg
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {showRequiredError && (
        <p id={errorId} className="mt-1 text-xs text-red-600 dark:text-red-400">
          Please select a category.
        </p>
      )}

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Category"
          className="absolute left-0 z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-zinc-200 bg-surface py-1 shadow-lg dark:border-zinc-700"
        >
          {allowEmpty && (
            <li role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={!value}
                onClick={() => selectCategory('')}
                className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 dark:hover:bg-zinc-800 ${
                  activeIndex === 0
                    ? 'bg-teal-50 text-teal-900 dark:bg-teal-500/10 dark:text-teal-100'
                    : !value
                      ? 'bg-teal-50/60 text-teal-800 dark:bg-teal-500/10 dark:text-teal-200'
                      : ''
                }`}
              >
                {emptyLabel}
              </button>
            </li>
          )}
          {(categories ?? []).map((category: ICategory, index) => {
            const optionIndex = allowEmpty ? index + 1 : index;
            const isSelected = category._id === value;
            return (
              <li key={category._id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => selectCategory(category._id)}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500 dark:hover:bg-zinc-800 ${
                    activeIndex === optionIndex || isSelected
                      ? 'bg-teal-50 text-teal-900 dark:bg-teal-500/10 dark:text-teal-100'
                      : 'text-zinc-900 dark:text-zinc-50'
                  }`}
                >
                  <CategoryOptionLabel category={category} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
