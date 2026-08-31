'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseDropdownKeyboardOptions {
  itemCount: number;
  enabled: boolean;
  onSelect: (index: number) => void;
  onClose: () => void;
  getOptionLabel?: (index: number) => string;
}

function isPrintableKey(key: string): boolean {
  return key.length === 1 && key !== ' ';
}

/** Arrow/Home/End/Enter/Escape and optional typeahead for listbox dropdowns. */
export function useDropdownKeyboard({
  itemCount,
  enabled,
  onSelect,
  onClose,
  getOptionLabel,
}: UseDropdownKeyboardOptions) {
  const [activeIndex, setActiveIndex] = useState(0);
  const typeaheadRef = useRef('');
  const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetIndex = useCallback(() => {
    setActiveIndex(0);
    typeaheadRef.current = '';
  }, []);

  useEffect(() => {
    return () => {
      if (typeaheadTimerRef.current) clearTimeout(typeaheadTimerRef.current);
    };
  }, []);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!enabled || itemCount === 0) return;

      if (getOptionLabel && isPrintableKey(event.key)) {
        event.preventDefault();
        typeaheadRef.current += event.key.toLowerCase();
        if (typeaheadTimerRef.current) clearTimeout(typeaheadTimerRef.current);
        typeaheadTimerRef.current = setTimeout(() => {
          typeaheadRef.current = '';
        }, 500);

        const prefix = typeaheadRef.current;
        const matchIndex = Array.from({ length: itemCount }, (_, index) => index).find(
          (index) => getOptionLabel(index).toLowerCase().startsWith(prefix),
        );
        if (matchIndex !== undefined) setActiveIndex(matchIndex);
        return;
      }

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
    [activeIndex, enabled, getOptionLabel, itemCount, onClose, onSelect],
  );

  return { activeIndex, setActiveIndex, handleKeyDown, resetIndex };
}
