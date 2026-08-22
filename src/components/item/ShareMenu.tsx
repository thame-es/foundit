'use client';

import { useState, useRef, useEffect } from 'react';
import { Share2, Link as LinkIcon, MessageCircle, Mail, Printer, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { logShareEvent } from '@/actions/analytics';
import { QRCodeGenerator } from './QRCodeGenerator';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';

interface ShareMenuProps {
  url: string;
  title: string;
  description: string;
  itemId: string;
  itemSlug: string;
  itemType: 'lost' | 'found';
}

export function ShareMenu({ url, title, description, itemId, itemSlug, itemType }: ShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  const shareText = `${title}\n\n${description}`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleShare = async (type: string, action: () => void) => {
    logShareEvent(type, itemType, itemId);
    action();
    if (type !== 'copy') setIsOpen(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shareText}\n\n${url}`);
    setCopied(true);
    addToast('success', 'Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)}>
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-[var(--bg-primary)] rounded-xl shadow-xl border border-[var(--border-primary)] p-4 z-50 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[var(--text-primary)]">Share Listing</h3>
            <button onClick={() => setIsOpen(false)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button 
                onClick={() => handleShare('native', nativeShare)}
                className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors group text-[var(--text-secondary)] hover:text-blue-600"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Share2 className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-[10px] font-medium text-center">More</span>
              </button>
            )}

            <button 
              onClick={() => handleShare('whatsapp', () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + '\n' + url)}`, '_blank'))}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors group text-[var(--text-secondary)] hover:text-green-600"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-[10px] font-medium text-center">WhatsApp</span>
            </button>

            <button 
              onClick={() => handleShare('email', () => window.open(`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText + '\n\nView details: ' + url)}`, '_blank'))}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors group text-[var(--text-secondary)] hover:text-red-600"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Mail className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-[10px] font-medium text-center">Email</span>
            </button>

            <button 
              onClick={() => handleShare('copy', copyToClipboard)}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors group text-[var(--text-secondary)] hover:text-slate-600"
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <LinkIcon className="w-5 h-5 text-slate-600" />}
              </div>
              <span className="text-[10px] font-medium text-center">{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          <div className="pt-3 border-t border-[var(--border-primary)] flex gap-2">
            <Link 
              href={`/${itemType}/${itemSlug}/print`}
              onClick={() => logShareEvent('print', itemType, itemId)}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--border-primary)] rounded-lg text-sm font-medium transition-colors"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Poster
            </Link>
          </div>

          <div className="pt-3 border-t border-[var(--border-primary)]">
            <p className="text-xs font-medium text-[var(--text-secondary)] mb-2 text-center">Scan QR Code</p>
            <QRCodeGenerator url={url} size={150} />
          </div>

        </div>
      )}
    </div>
  );
}
