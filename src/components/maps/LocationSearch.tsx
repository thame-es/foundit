'use client';

// ===========================================
// FoundIt — Location Search Component
// ===========================================
// Geocoding using Nominatim (OpenStreetMap).
// Debounced to respect rate limits.
// ===========================================

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { appConfig } from '@/lib/config';

interface SearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number, displayName: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationSearch({ onLocationSelect, placeholder = 'Search for a location...', className }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length < 3) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `${appConfig.maps.nominatimUrl}/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
          {
            headers: {
              // Nominatim requires a valid User-Agent
              'User-Agent': `${appConfig.name} (${appConfig.url})`
            }
          }
        );
        
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        setResults(data);
        setShowResults(true);
      } catch (error) {
        console.error('Geocoding error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setQuery(result.display_name);
    setShowResults(false);
    onLocationSelect(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (results.length > 0) setShowResults(true); }}
        placeholder={placeholder}
        icon={isSearching ? <Loader2 className="w-4 h-4 animate-spin text-[var(--color-primary-500)]" /> : <Search className="w-4 h-4" />}
      />

      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
          {results.map((result) => (
            <button
              key={result.place_id}
              onClick={() => handleSelect(result)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-tertiary)] text-left transition-colors border-b border-[var(--border-primary)] last:border-0"
            >
              <MapPin className="w-4 h-4 mt-0.5 text-[var(--text-tertiary)] flex-shrink-0" />
              <span className="text-sm text-[var(--text-primary)]">{result.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
