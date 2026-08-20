'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

// Dynamically import the map components with SSR disabled
// Leaflet requires the window object which is only available in the browser

export const DynamicLocationPicker = dynamic(
  () => import('./LocationPicker'),
  { 
    ssr: false,
    loading: function Loading() { return React.createElement(Skeleton, { className: "h-[300px] w-full rounded-xl" }); }
  }
);
