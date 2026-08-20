'use client';

// ===========================================
// FoundIt — Logo Component
// ===========================================

import { cn } from '@/lib/utils';
import { appConfig } from '@/lib/config';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 40, text: 'text-2xl' },
  };

  const s = sizes[size];

  return (
    <Link href="/" className={cn('flex items-center gap-2 group', className)} aria-label={`${appConfig.name} home`}>
      {/* Logo Mark — Abstract compass/return arrow */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Outer circle */}
        <circle
          cx="20"
          cy="20"
          r="18"
          stroke="url(#logoGradient)"
          strokeWidth="2.5"
          fill="none"
          className="transition-all duration-300 group-hover:stroke-[3]"
        />
        {/* Return arrow path */}
        <path
          d="M14 20C14 16.686 16.686 14 20 14C23.314 14 26 16.686 26 20C26 23.314 23.314 26 20 26"
          stroke="url(#logoGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Arrow head */}
        <path
          d="M17 23L20 26L17 29"
          stroke="url(#logoGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Center dot */}
        <circle
          cx="20"
          cy="20"
          r="2.5"
          fill="url(#logoGradient)"
          className="transition-all duration-300 group-hover:r-[3]"
        />
        <defs>
          <linearGradient id="logoGradient" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--color-primary-500)" />
            <stop offset="1" stopColor="var(--color-accent-500)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Text Logo */}
      {showText && (
        <span className={cn(
          'font-bold tracking-tight',
          s.text
        )}>
          <span className="text-[var(--color-primary-600)] dark:text-[var(--color-primary-400)]">Found</span>
          <span className="text-[var(--text-primary)]">It</span>
        </span>
      )}
    </Link>
  );
}
