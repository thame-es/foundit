import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { QRCodeGenerator } from '@/components/item/QRCodeGenerator';
import { appConfig } from '@/lib/config';
import { format } from 'date-fns';
import { PrintButton } from '@/components/item/PrintButton';
import Image from 'next/image';
import { reverseGeocode } from '@/lib/geo';

export default async function LostItemPrintPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const item = await db.lostItem.findUnique({
    where: { slug: resolvedParams.slug },
    include: {
      category: true,
      images: { orderBy: { order: 'asc' } }
    }
  });

  if (!item) notFound();

  const publicUrl = `${appConfig.url}/lost/${item.slug}`;
  const dateStr = item.dateApproximate 
    ? `Around ${format(item.dateLost, 'MMMM do, yyyy')}`
    : format(item.dateLost, 'MMMM do, yyyy');

  // Determine location text
  let locationText = [item.area, item.city, item.region].filter(Boolean).join(', ');
  if (!locationText && item.latitude && item.longitude) {
    const geocoded = await reverseGeocode(item.latitude, item.longitude);
    locationText = geocoded ? geocoded : `Coordinates: ${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`;
  } else if (!locationText) {
    locationText = 'Not specified';
  }

  return (
    <div className="min-h-screen bg-white text-black p-8 max-w-4xl mx-auto print:p-0 print:m-0">
      
      {/* Non-print control bar */}
      <div className="mb-8 p-4 bg-slate-100 rounded-xl flex justify-between items-center print:hidden">
        <p className="text-sm text-slate-600">This page is optimized for A4 portrait printing.</p>
        <PrintButton colorClass="bg-blue-600 hover:bg-blue-700" />
      </div>

      {/* Poster Layout */}
      <div className="border-[12px] border-blue-600 p-6 sm:p-8 flex flex-col relative print:border-[12px] print:rounded-none print:h-[297mm] print:overflow-hidden box-border bg-white h-auto min-h-[900px]">
        
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b-4 border-blue-100 shrink-0">
          <h2 className="text-xl font-bold text-blue-600 tracking-wider uppercase mb-1">FindBack</h2>
          <h1 className="text-5xl sm:text-6xl font-black text-slate-900 uppercase tracking-tight">LOST ITEM</h1>
        </div>

        {/* Title */}
        <div className="text-center mb-6 shrink-0">
          <h3 className="text-3xl sm:text-4xl font-bold text-slate-800 line-clamp-2">{item.title}</h3>
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

          {/* Details */}
          {/* Details */}
          <div className="w-full max-w-2xl bg-slate-50 p-3 sm:p-5 rounded-2xl border-2 border-slate-200 text-center shrink-0">
            <p className="text-base sm:text-lg mb-1 text-slate-700">
              <span className="font-bold text-slate-900">Category:</span> {item.category.name}
            </p>
            <p className="text-base sm:text-lg mb-1 text-slate-700">
              <span className="font-bold text-slate-900">Date Lost:</span> {dateStr}
            </p>
            <div className="text-base sm:text-lg text-slate-700">
              <span className="font-bold text-slate-900">Approximate Area:</span>
              <div className="line-clamp-2 leading-snug mt-1">{locationText}</div>
            </div>
          </div>

          <div className="text-center max-w-2xl text-lg sm:text-xl text-slate-800 italic line-clamp-3 shrink-0">
            "{item.publicDescription}"
          </div>
        </div>

        {/* Footer / Call to Action */}
        <div className="mt-6 pt-6 border-t-4 border-blue-100 flex items-center justify-between shrink-0">
          <div className="flex-1 pr-6">
            <h4 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">Have you seen this?</h4>
            <p className="text-lg text-slate-600 leading-snug">
              Scan the QR code to view more details and securely contact the owner through the FindBack platform. 
            </p>
            <p className="mt-3 text-base font-medium text-slate-500 truncate">
              URL: {publicUrl}
            </p>
          </div>
          <div className="flex-shrink-0 bg-white p-2 rounded-xl shadow-md border-2 border-slate-200">
            <QRCodeGenerator url={publicUrl} size={140} />
          </div>
        </div>

      </div>
    </div>
  );
}
