'use client';

import { useCallback, useState } from 'react';

interface UseDropdownKeyboardOptions {
  itemCount: number;
  onSelect: (index: number) => void;
  onClose: () => void;
  enabled: boolean;
}

/** Arrow/Home/End/Enter/Escape handlers for custom listbox-style dropdowns. */
export function useDropdownKeyboard({
  itemCount,
  onSelect,
  onClose,
  enabled,
}: UseDropdownKeyboardOptions) {
  const [activeIndex, setActiveIndex] = useState(0);

  const resetIndex = useCallback(() => setActiveIndex(0), []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!enabled || itemCount === 0) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setActiveIndex((index) => (index + 1) % itemCount);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setActiveIndex((index) => (index - 1 + itemCount) % itemCount);
          break;
        case 'Home':
          event.preventDefault();
          setActiveIndex(0);
          break;
        case 'End':
          event.preventDefault();
          setActiveIndex(itemCount - 1);
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          onSelect(activeIndex);
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
      }
    },
    [activeIndex, enabled, itemCount, onClose, onSelect],
  );

  return { activeIndex, setActiveIndex, handleKeyDown, resetIndex };
}
