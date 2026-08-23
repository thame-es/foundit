'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2 } from 'lucide-react';
import { deleteFoundItem, deleteLostItem } from '@/actions/items';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

interface ItemActionsProps {
  itemId: string;
  itemType: 'lost' | 'found';
  itemSlug: string;
}

export function ItemActions({ itemId, itemType, itemSlug }: ItemActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    
    try {
      const result = itemType === 'lost' 
        ? await deleteLostItem(itemId) 
        : await deleteFoundItem(itemId);
        
      if (result.success) {
        addToast('success', 'Listing deleted successfully');
        router.push('/dashboard');
      } else {
        addToast('error', result.error || 'Failed to delete listing');
        setIsDeleting(false);
      }
    } catch {
      addToast('error', 'An unexpected error occurred');
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    router.push(`/${itemType}/${itemSlug}/edit`);
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        icon={<Edit className="w-4 h-4" />}
        onClick={handleEdit}
        disabled={isDeleting}
      >
        Edit
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        icon={<Trash2 className="w-4 h-4" />}
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? 'Deleting...' : 'Delete'}
      </Button>
    </div>
  );
}
