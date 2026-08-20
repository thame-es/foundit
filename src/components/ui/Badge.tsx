'use client';

// ===========================================
// FoundIt — Badge / Status Badge Component
// ===========================================

import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'lost' | 'found';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variants = {
  default: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]',
  primary: 'bg-[var(--color-primary-100)] text-[var(--color-primary-700)] dark:bg-[var(--color-primary-900)] dark:text-[var(--color-primary-300)]',
  secondary: 'bg-[var(--color-secondary-100)] text-[var(--color-secondary-700)] dark:bg-[var(--color-secondary-900)] dark:text-[var(--color-secondary-300)]',
  success: 'bg-[var(--color-success-light)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-light)] text-[var(--color-danger)]',
  info: 'bg-[var(--color-info-light)] text-[var(--color-info)]',
  lost: 'bg-[#fffbeb] !text-[#92400e] dark:bg-[#78350f]/30 dark:!text-[#fcd34d]',
  found: 'bg-[#dcfce7] !text-[#166534] dark:bg-[#14532d]/30 dark:!text-[#86efac]',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({ variant = 'default', size = 'sm', children, className, dot }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 font-medium rounded-full',
      variants[variant],
      sizes[size],
      className
    )}>
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'success' ? 'bg-green-500' :
          variant === 'warning' ? 'bg-amber-500' :
          variant === 'danger' ? 'bg-red-500' :
          variant === 'found' ? 'bg-emerald-500' :
          variant === 'lost' ? 'bg-amber-500' :
          'bg-current'
        )} />
      )}
      {children}
    </span>
  );
}
