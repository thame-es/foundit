'use client';

import { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';

interface QRCodeGeneratorProps {
  url: string;
  size?: number;
}

export function QRCodeGenerator({ url, size = 200 }: QRCodeGeneratorProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeUrl, setActiveUrl] = useState<string>(url);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // If the server fallback (localhost) leaked through to the client, forcefully correct it
    if (typeof window !== 'undefined' && url.includes('localhost')) {
      setActiveUrl(window.location.href);
    } else {
      setActiveUrl(url);
    }
  }, [url]);

  useEffect(() => {
    if (canvasRef.current && activeUrl) {
      QRCode.toCanvas(canvasRef.current, activeUrl, {
        width: size,
        margin: 1,
        color: {
          dark: '#0f172a', // Slate 900
          light: '#ffffff'
        }
      }, (err) => {
        if (err) console.error('QR code generation failed', err);
      });
      
      QRCode.toDataURL(activeUrl, {
        width: size * 4, // High res for download
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }, (err, dataUrl) => {
        if (!err) setQrDataUrl(dataUrl);
      });
    }
  }, [activeUrl, size]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = 'findback-listing-qr.png';
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white p-2 rounded-xl shadow-sm border border-[var(--border-primary)]">
        <canvas ref={canvasRef} aria-label="QR Code leading to this listing" />
      </div>
      <Button variant="outline" size="sm" onClick={handleDownload} className="w-full flex-shrink-0">
        <Download className="w-4 h-4 mr-2" />
        Download QR
      </Button>
    </div>
  );
}
