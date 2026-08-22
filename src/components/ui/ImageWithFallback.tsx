'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function ImageWithFallback({ src, fallbackSrc, alt, className, ...props }: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  if (hasError || !imgSrc) {
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
      src={imgSrc}
      alt={alt || ''}
      onError={() => {
        setHasError(true);
      }}
    />
  );
}
