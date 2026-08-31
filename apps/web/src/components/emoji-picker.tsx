'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { SYSTEM_CATEGORIES } from '@finance-tracker/shared';

const CATEGORY_EMOJIS = [
  ...new Set(SYSTEM_CATEGORIES.map((category) => category.icon)),
];

const EXTRA_EMOJIS = [
  '🏷️', '💰', '💳', '🏦', '📱', '☕', '🍕', '🎮', '🎵', '🏋️',
  '🐾', '🌿', '🎁', '🔧', '👕', '💊', '🚌', '⛽', '📺', '🧾',
];

export const EMOJI_OPTIONS = [...new Set([...CATEGORY_EMOJIS, ...EXTRA_EMOJIS])];

interface EmojiPickerProps {
  id: string;
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ id, value, onChange }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={id} className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
        Icon
      </label>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-surface px-3 text-lg transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        <span aria-hidden="true">{value || '🏷️'}</span>
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Choose emoji
        </span>
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Category emoji"
          className="absolute left-0 z-20 mt-1 grid max-h-48 w-full grid-cols-6 gap-1 overflow-y-auto rounded-lg border border-zinc-200 bg-surface p-2 shadow-lg dark:border-zinc-700"
        >
          {EMOJI_OPTIONS.map((emoji) => {
            const selected = emoji === value;
            return (
              <li key={emoji} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(emoji);
                    setOpen(false);
                  }}
                  className={`flex h-9 w-full items-center justify-center rounded-md text-lg transition-colors hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:hover:bg-zinc-800 ${
                    selected ? 'bg-teal-50 ring-1 ring-teal-500/40 dark:bg-teal-500/10' : ''
                  }`}
                >
                  {emoji}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
