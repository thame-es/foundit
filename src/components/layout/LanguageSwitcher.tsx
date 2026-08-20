'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const switchLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] rounded-md transition-colors"
        aria-label="Select Language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{locale === 'en' ? 'EN' : 'മലയാളം'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-lg shadow-lg py-1 z-50">
          <button
            onClick={() => switchLanguage('en')}
            className={`w-full text-left px-4 py-2 text-sm ${
              locale === 'en' 
                ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] font-medium' 
                : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            English
          </button>
          <button
            onClick={() => switchLanguage('ml')}
            className={`w-full text-left px-4 py-2 text-sm ${
              locale === 'ml' 
                ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)] font-medium' 
                : 'text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            മലയാളം
          </button>
        </div>
      )}
    </div>
  );
}
