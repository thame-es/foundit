'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function ImageWithFallback({ src, alt, className, ...props }: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setPrevSrc(src);
    setHasError(false);
  }

  if (hasError || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-[var(--text-tertiary)] ${className}`}>
        <ImageIcon className="w-1/3 h-1/3 opacity-20 mb-2 max-w-[40px] max-h-[40px]" />
        <span className="text-xs opacity-40 font-medium">No Image</span>
      </div>
    );
  }

  return (
    <img
      {...props}
      className={className}
      src={src}
      alt={alt || ''}
      onError={() => {
        setHasError(true);
      }}
    />
  );
}
