'use client';

// ===========================================
// FoundIt — Navigation Progress Bar
// ===========================================
// A slim animated progress bar at the top of
// the page that shows during route transitions.
// ===========================================

import { useEffect, useState, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // When the route changes, complete the progress bar
    if (visible) {
      setProgress(100);
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pathname, searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for click events on links to start the progress bar
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;

      // Skip external links, hash links, and same-page links
      if (
        href.startsWith('http') ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href === pathname ||
        anchor.target === '_blank'
      ) {
        return;
      }

      // Start the progress bar
      setProgress(0);
      setVisible(true);

      // Animate progress incrementally
      let currentProgress = 0;
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        currentProgress += Math.random() * 15;
        if (currentProgress > 90) {
          currentProgress = 90;
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
        setProgress(currentProgress);
      }, 200);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[3px]">
      <div
        className="h-full bg-gradient-to-r from-[var(--color-primary-400)] via-[var(--color-primary-500)] to-[var(--color-primary-600)] shadow-[0_0_10px_var(--color-primary-400)]"
        style={{
          width: `${progress}%`,
          transition: progress === 0 ? 'none' : 'width 0.3s ease-out',
        }}
      />
    </div>
  );
}
