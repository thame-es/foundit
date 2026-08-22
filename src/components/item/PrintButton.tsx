'use client';

import { Printer } from 'lucide-react';

interface PrintButtonProps {
  colorClass?: string;
}

export function PrintButton({ colorClass = 'bg-blue-600 hover:bg-blue-700' }: PrintButtonProps) {
  return (
    <button 
      onClick={() => window.print()} 
      className={`${colorClass} text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors shadow-sm`}
    >
      <Printer className="w-4 h-4 mr-2" />
      Print Poster
    </button>
  );
}
