'use client';

// ===========================================
// FoundIt — UI Select Component
// ===========================================

import { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  className,
  label,
  error,
  hint,
  options,
  placeholder = 'Select an option',
  id,
  ...props
}, ref) => {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-[var(--text-primary)] mb-1.5"
        >
          {label}
          {props.required && <span className="text-[var(--color-danger)] ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          className={cn(
            'w-full px-4 py-2.5 pr-10 rounded-xl border text-sm appearance-none',
            'bg-[var(--bg-primary)] text-[var(--text-primary)]',
            'border-[var(--border-primary)]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)] focus:border-transparent',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]',
            className
          )}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none" />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-[var(--color-danger)]" role="alert">{error}</p>
      )}
      {hint && !error && (
        <p className="mt-1.5 text-sm text-[var(--text-tertiary)]">{hint}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export { Select };
export type { SelectProps, SelectOption };
