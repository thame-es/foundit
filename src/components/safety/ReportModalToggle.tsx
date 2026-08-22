'use client';

import { useState } from 'react';
import { ReportModal } from './ReportModal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';

interface ReportModalToggleProps {
  targetType: 'user' | 'item' | 'lost_item' | 'found_item';
  targetId: string;
  targetName: string;
  variant?: 'button' | 'text';
}

export function ReportModalToggle({ targetType, targetId, targetName, variant = 'text' }: ReportModalToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {variant === 'button' ? (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          onClick={() => setIsOpen(true)}
          icon={<AlertTriangle className="w-4 h-4" />}
        >
          Report
        </Button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="text-xs text-[var(--text-tertiary)] hover:text-red-600 transition-colors flex items-center gap-1 mx-auto mt-4"
        >
          <AlertTriangle className="w-3 h-3" /> Report this {targetType}
        </button>
      )}

      <ReportModal 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        targetType={targetType}
        targetId={targetId}
        targetName={targetName}
      />
    </>
  );
}
