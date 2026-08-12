import React, { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface NeoSelectOption<T extends string | number> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

interface NeoSelectProps<T extends string | number> {
  value: T;
  options: NeoSelectOption<T>[];
  onValueChange: (value: T) => void;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  ariaLabel?: string;
}

/** A shared, keyboard-accessible neumorphic select control. */
export function NeoSelect<T extends string | number>({
  value,
  options,
  onValueChange,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  ariaLabel,
}: NeoSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    const closeOnOutsidePointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className={`neo-select ${className}`}>
      <button
        type="button"
        className={`neo-select__trigger ${buttonClassName}`}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setIsOpen(true);
          }
        }}
      >
        <span className="neo-select__value">{selected?.label}</span>
        <ChevronDown size={16} className={`neo-select__chevron ${isOpen ? 'neo-select__chevron--open' : ''}`} />
      </button>

      {isOpen && (
        <div id={listboxId} role="listbox" className={`neo-select__menu ${menuClassName}`}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                type="button"
                key={String(option.value)}
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                className={`neo-select__option ${isSelected ? 'neo-select__option--selected' : ''}`}
                onClick={() => {
                  if (!option.disabled) onValueChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span>{option.label}</span>
                {isSelected && <Check size={14} strokeWidth={3} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
