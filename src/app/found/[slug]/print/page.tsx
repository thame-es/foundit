import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { QRCodeGenerator } from '@/components/item/QRCodeGenerator';
import { appConfig } from '@/lib/config';
import { format } from 'date-fns';
import { PrintButton } from '@/components/item/PrintButton';
import Image from 'next/image';
import { reverseGeocode } from '@/lib/geo';

export default async function FoundItemPrintPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const item = await db.foundItem.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      category: true,
      images: { orderBy: { order: 'asc' } }
    }
  });

  if (!item) notFound();

  const headersList = await headers();
  const host = headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000';
  const protocol = headersList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
  const baseUrl = `${protocol}://${host}`;
  const publicUrl = `${baseUrl}/found/${item.slug}`;
  const dateStr = item.dateApproximate 
    ? `Around ${format(item.dateFound, 'MMMM do, yyyy')}`
    : format(item.dateFound, 'MMMM do, yyyy');

  // Determine location text
  let locationText = [item.area, item.city, item.region].filter(Boolean).join(', ');
  if (!locationText && item.latitude && item.longitude) {
    const geocoded = await reverseGeocode(item.latitude, item.longitude);
    locationText = geocoded ? geocoded : `Coordinates: ${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`;
  } else if (!locationText) {
    locationText = 'Not specified';
  }

  return (
    <div className="min-h-screen bg-white text-black p-2 sm:p-8 max-w-4xl mx-auto print:p-0 print:m-0 overflow-x-hidden">
      
      {/* Non-print control bar */}
      <div className="mb-4 sm:mb-8 p-3 sm:p-4 bg-slate-100 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3 print:hidden">
        <p className="text-xs sm:text-sm text-slate-600 text-center sm:text-left">This page is optimized for A4 portrait printing.</p>
        <PrintButton colorClass="bg-emerald-600 hover:bg-emerald-700" />
      </div>

      {/* Poster Layout */}
      <div className="border-[6px] sm:border-[12px] border-emerald-600 p-4 sm:p-8 flex flex-col relative print:border-[12px] print:rounded-none print:h-[297mm] print:w-[210mm] print:overflow-hidden box-border bg-white h-auto sm:min-h-[900px] w-full max-w-full">
        
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 pb-2 sm:pb-4 border-b-4 border-emerald-100 shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-emerald-600 tracking-wider uppercase mb-1">FindBack</h2>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 uppercase tracking-tight">FOUND ITEM</h1>
        </div>

        {/* Title */}
        <div className="text-center mb-4 sm:mb-6 shrink-0">
          <h3 className="text-2xl sm:text-4xl font-bold text-slate-900 break-words">{item.title}</h3>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center gap-4 min-h-0">
          
          {/* Main Image */}
          {item.images.length > 0 ? (
            <div className="w-full max-w-[220px] sm:max-w-[240px] shrink-0 aspect-square rounded-2xl overflow-hidden border-4 border-slate-100 shadow-md relative">
              <img 
                src={`/api/uploads/medium/${item.images[0].filename}`} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full max-w-[220px] sm:max-w-[240px] shrink-0 aspect-square rounded-2xl bg-slate-100 border-4 border-slate-200 flex items-center justify-center">
              <span className="text-slate-400 font-medium text-sm">No Image Available</span>
            </div>
          )}

          {/* Details Box */}
          <div className="bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-200 mb-4 sm:mb-6 shrink-0 w-full">
            <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-center">
              <p className="text-slate-700">
                <span className="font-bold text-slate-900">Category:</span> {item.category.name}
              </p>
              <p className="text-slate-700">
                <span className="font-bold text-slate-900">Date Found:</span> {dateStr}
              </p>
              <div className="text-slate-700">
                <span className="font-bold text-slate-900">Approximate Area:</span>
                <div className="line-clamp-2 leading-snug mt-1">{locationText}</div>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <div className="mb-4 sm:mb-auto border-b-2 border-slate-100 pb-4 sm:pb-6 grow w-full">
            <p className="text-sm sm:text-lg text-slate-700 italic text-center whitespace-pre-wrap leading-relaxed break-words">
              "{item.publicDescription}"
            </p>
          </div>

          {/* Footer with QR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 sm:pt-6 shrink-0 w-full">
            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Is this yours?</h4>
              <p className="text-sm sm:text-base text-slate-600 mb-4 max-w-md mx-auto sm:mx-0">
                Scan the QR code to view more details and securely contact the finder through the FindBack platform to arrange a return.
              </p>
              <p className="text-xs text-slate-400 font-mono break-all">{`URL: ${publicUrl}`}</p>
            </div>
            
            <div className="bg-white p-3 rounded-2xl border-2 border-slate-100 shadow-sm shrink-0">
              <QRCodeGenerator url={publicUrl} size={140} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
