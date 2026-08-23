'use client';

import { ShieldAlert, MapPin, Calendar, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface PossibleMatchCardProps {
  matchId: string;
  score: number;
  confidence: string; // 'strong' | 'possible' | 'weak'
  reasons: string[];
  status: string;
  item: {
    title: string;
    slug: string;
    type: 'lost' | 'found';
    locationString: string;
    date: Date;
    imageUrl?: string | null;
  };
  onDismiss: (id: string) => void;
  onAction: (id: string) => void;
}

export function PossibleMatchCard({ matchId, score, confidence, reasons, status, item, onDismiss, onAction }: PossibleMatchCardProps) {
  const getConfidenceColor = () => {
    switch(confidence) {
      case 'strong': return 'text-green-600 bg-green-50 border-green-200';
      case 'possible': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getConfidenceIcon = () => {
    switch(confidence) {
      case 'strong': return <ShieldCheck className="w-5 h-5" />;
      case 'possible': return <CheckCircle2 className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getConfidenceColor()}`}>
              {getConfidenceIcon()}
              {confidence.charAt(0).toUpperCase() + confidence.slice(1)} Match ({Math.round(score)}%)
            </span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {item.type} Item
            </span>
          </div>
          
          <Link href={`/${item.type}/${item.slug}`} className="block group">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[var(--color-primary-600)] transition-colors truncate">
              {item.title}
            </h3>
          </Link>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.locationString || 'Location unknown'}</span>
            </div>
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>{new Date(item.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        {item.imageUrl && (
          <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-50">
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-sm">
        <h4 className="font-semibold text-gray-900 mb-2">Why it matched:</h4>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          {reasons.slice(0, 4).map((r, i) => (
            <li key={i}>{r}</li>
          ))}
          {reasons.length > 4 && <li>And {reasons.length - 4} more factors</li>}
        </ul>
      </div>

      <div className="flex items-start gap-3 text-xs text-gray-500 bg-amber-50 text-amber-800 p-3 rounded-lg">
        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
        <p>A possible match is not proof of ownership. Please verify details before confirming a claim.</p>
      </div>

      {status === 'active' && (
        <div className="flex items-center gap-3 mt-2 pt-4 border-t border-gray-100">
          <button 
            onClick={() => onAction(matchId)}
            className="flex-1 bg-[var(--color-primary-600)] text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-[var(--color-primary-700)] transition-colors"
          >
            {item.type === 'found' ? 'Contact Finder' : 'Claim Item'}
          </button>
          <button 
            onClick={() => onDismiss(matchId)}
            className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}
      {status !== 'active' && (
        <div className="mt-2 pt-4 border-t border-gray-100 text-sm text-gray-500 font-medium">
          Match is currently {status}.
        </div>
      )}
    </div>
  );
}
