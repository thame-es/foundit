'use client';

// ===========================================
// FoundIt — Header Badges Client
// ===========================================
// Client component that receives streamed badge
// counts and updates the DOM via a portal-like
// approach using a global event.
// ===========================================

import { useEffect } from 'react';

interface HeaderBadgesClientProps {
  notificationCount: number;
  messageCount: number;
}

// Global event to broadcast badge counts to the Header
export function HeaderBadgesClient({ notificationCount, messageCount }: HeaderBadgesClientProps) {
  useEffect(() => {
    // Dispatch a custom event that the Header listens to
    window.dispatchEvent(
      new CustomEvent('header-badges-update', {
        detail: { notificationCount, messageCount },
      })
    );
  }, [notificationCount, messageCount]);

  return null; // Renders nothing visually — just pushes data to Header
}
