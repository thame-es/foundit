'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { LocationSearch } from '@/components/maps/LocationSearch';
import { Search, Filter, X, MapPin, Bell } from 'lucide-react';
import { defaultCategories } from '@/lib/config';
import { createSavedSearch } from '@/actions/savedSearches';

export function SearchClientFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [lat, setLat] = useState<string | null>(searchParams.get('lat'));
  const [lng, setLng] = useState<string | null>(searchParams.get('lng'));
  const [locationName, setLocationName] = useState(searchParams.get('locName') || '');
  const [radius, setRadius] = useState(searchParams.get('radius') || '');
  const [date, setDate] = useState(searchParams.get('date') || 'any');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  
  // Advanced
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [colour, setColour] = useState(searchParams.get('colour') || '');

  const applyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    
    if (query) params.set('q', query);
    if (type !== 'all') params.set('type', type);
    if (category) params.set('category', category);
    
    if (lat && lng) {
      params.set('lat', lat);
      params.set('lng', lng);
      if (locationName) params.set('locName', locationName);
      if (radius) params.set('radius', radius);
    }
    
    if (date !== 'any') params.set('date', date);
    if (sort !== 'newest') params.set('sort', sort);
    if (brand) params.set('brand', brand);
    if (colour) params.set('colour', colour);

    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setQuery('');
    setType('all');
    setCategory('');
    setLat(null);
    setLng(null);
    setLocationName('');
    setRadius('');
    setDate('any');
    setSort('newest');
    setBrand('');
    setColour('');
    router.push('/search');
  };

  const removeFilter = (key: string) => {
    if (key === 'q') setQuery('');
    else if (key === 'category') setCategory('');
    else if (key === 'location') {
      setLat(null); setLng(null); setLocationName(''); setRadius('');
    }
    else if (key === 'date') setDate('any');
    else if (key === 'brand') setBrand('');
    else if (key === 'colour') setColour('');
    
    // We need to trigger an apply right away but React state update is async.
    // Better to reconstruct params directly:
    const params = new URLSearchParams(searchParams.toString());
    if (key === 'location') { params.delete('lat'); params.delete('lng'); params.delete('locName'); params.delete('radius'); }
    else params.delete(key);
    
    router.push(`/search?${params.toString()}`);
  };

  const handleSaveSearch = async () => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Generate a default name
    let nameParts = [];
    if (query) nameParts.push(`"${query}"`);
    if (category) nameParts.push(defaultCategories.find(c => c.slug === category)?.name || category);
    if (locationName) nameParts.push(`near ${locationName}`);
    
    const searchName = nameParts.length > 0 ? `Alert: ${nameParts.join(' ')}` : `Saved Search (${new Date().toLocaleDateString()})`;

    const input = {
      name: searchName,
      query: query || undefined,
      type: (type as any) === 'all' ? 'all' : (type as any) || 'all',
      categoryId: category || undefined,
      brand: brand || undefined,
      colour: colour || undefined,
      latitude: lat ? parseFloat(lat) : undefined,
      longitude: lng ? parseFloat(lng) : undefined,
      locationName: locationName || undefined,
      radius: radius ? parseFloat(radius) : undefined,
      datePreference: date !== 'any' ? date : undefined,
      alertsEnabled: true,
    };

    const result = await createSavedSearch(input);
    if (!result.success) {
      if (result.error === 'Unauthorized') {
        const callbackUrl = `/search?${params.toString()}`;
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } else {
      alert('Search saved successfully! You will be notified of new matches.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Search Bar */}
      <form onSubmit={applyFilters} className="flex flex-col sm:flex-row gap-3 p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
          <Input 
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for keys, phones, wallets..." 
            className="pl-10 !border-0 bg-transparent shadow-none"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select 
            value={type}
            onChange={e => setType(e.target.value)}
            options={[
              { value: 'all', label: 'Lost & Found' },
              { value: 'lost', label: 'Only Lost Items' },
              { value: 'found', label: 'Only Found Items' }
            ]}
            className="!border-0 bg-transparent shadow-none"
          />
        </div>
        <Button type="submit" className="sm:w-auto w-full">Search</Button>
      </form>

      {/* Active Filters */}
      {(query || category || locationName || date !== 'any' || brand || colour) && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-[var(--text-secondary)] mr-2">Active filters:</span>
          {query && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-primary-50)] text-[var(--color-primary-700)] rounded-full text-xs font-medium">
              "{query}" <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('q')} />
            </span>
          )}
          {category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-primary-50)] text-[var(--color-primary-700)] rounded-full text-xs font-medium">
              {defaultCategories.find(c => c.slug === category)?.name || category} <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('category')} />
            </span>
          )}
          {locationName && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-primary-50)] text-[var(--color-primary-700)] rounded-full text-xs font-medium">
              <MapPin className="w-3 h-3" /> {locationName} {radius ? `(+${radius}km)` : ''} <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('location')} />
            </span>
          )}
          {date !== 'any' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-primary-50)] text-[var(--color-primary-700)] rounded-full text-xs font-medium">
              Date: {date} <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('date')} />
            </span>
          )}
          {brand && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-primary-50)] text-[var(--color-primary-700)] rounded-full text-xs font-medium">
              Brand: {brand} <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('brand')} />
            </span>
          )}
          {colour && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-primary-50)] text-[var(--color-primary-700)] rounded-full text-xs font-medium">
              Colour: {colour} <X className="w-3 h-3 cursor-pointer" onClick={() => removeFilter('colour')} />
            </span>
          )}
          <button onClick={clearFilters} className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-primary)] underline ml-2">
            Clear All
          </button>
          
          <div className="ml-auto flex items-center">
            <Button variant="outline" size="sm" onClick={handleSaveSearch} className="h-7 text-xs px-3 rounded-full border-[var(--color-primary-200)] text-[var(--color-primary-700)] bg-[var(--color-primary-50)] hover:bg-[var(--color-primary-100)]">
              <Bell className="w-3 h-3 mr-1" /> Save Search & Alert
            </Button>
          </div>
        </div>
      )}

      {/* Sidebar Form layout injected via children or alongside */}
    </div>
  );
}

export function SidebarFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [lat, setLat] = useState<string | null>(searchParams.get('lat'));
  const [lng, setLng] = useState<string | null>(searchParams.get('lng'));
  const [locationName, setLocationName] = useState(searchParams.get('locName') || '');
  const [radius, setRadius] = useState(searchParams.get('radius') || '');
  const [date, setDate] = useState(searchParams.get('date') || 'any');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [colour, setColour] = useState(searchParams.get('colour') || '');

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (category) params.set('category', category); else params.delete('category');
    
    if (lat && lng) {
      params.set('lat', lat);
      params.set('lng', lng);
      if (locationName) params.set('locName', locationName);
      if (radius) params.set('radius', radius); else params.delete('radius');
    } else {
      params.delete('lat'); params.delete('lng'); params.delete('locName'); params.delete('radius');
    }
    
    if (date !== 'any') params.set('date', date); else params.delete('date');
    if (sort !== 'newest') params.set('sort', sort); else params.delete('sort');
    if (brand) params.set('brand', brand); else params.delete('brand');
    if (colour) params.set('colour', colour); else params.delete('colour');
    
    // reset page
    params.delete('page');

    router.push(`/search?${params.toString()}`);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude.toString());
          setLng(pos.coords.longitude.toString());
          setLocationName('My Location');
          setRadius('10');
          // automatically apply
          setTimeout(applyFilters, 100);
        },
        (err) => {
          console.error("Location access denied or failed", err);
          alert("Could not access your location. Please check browser permissions.");
        }
      );
    }
  };

  return (
    <div className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] sticky top-24 overflow-hidden flex flex-col max-h-[calc(100vh-120px)] shadow-sm">
      <div className="p-4 border-b border-[var(--border-primary)] flex-shrink-0 bg-[var(--bg-primary)] z-10">
        <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
          <Filter className="w-4 h-4" /> Filters
        </div>
      </div>
      
      <div className="p-4 overflow-y-auto custom-scrollbar space-y-5 flex-1">
        
        {/* Sort */}
        <div>
          <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">Sort By</div>
          <Select 
            value={sort}
            onChange={e => { setSort(e.target.value); setTimeout(applyFilters, 0); }}
            options={[
              { value: 'newest', label: 'Newest Listing' },
              { value: 'recent_date', label: 'Recent Date (Lost/Found)' },
              { value: 'nearest', label: 'Nearest Distance', disabled: !lat },
            ]}
          />
        </div>

        {/* Location */}
        <div>
          <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">Location</div>
          <div className="space-y-3">
            <LocationSearch 
              placeholder={locationName || "Enter city or area..."}
              onLocationSelect={(l_lat, l_lng, name) => {
                setLat(l_lat.toString());
                setLng(l_lng.toString());
                setLocationName(name);
                if (!radius) setRadius('10'); // default 10km when picking
              }}
            />
            {lat && (
              <Select
                value={radius}
                onChange={e => setRadius(e.target.value)}
                options={[
                  { value: '1', label: 'Within 1 km' },
                  { value: '5', label: 'Within 5 km' },
                  { value: '10', label: 'Within 10 km' },
                  { value: '25', label: 'Within 25 km' },
                  { value: '50', label: 'Within 50 km' },
                ]}
              />
            )}
            <button 
              type="button" 
              onClick={getUserLocation}
              className="text-xs text-[var(--color-primary-600)] font-medium hover:underline flex items-center gap-1"
            >
              <MapPin className="w-3 h-3" /> Use my current location
            </button>
          </div>
        </div>

        {/* Date */}
        <div>
          <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">Date</div>
          <Select
            value={date}
            onChange={e => setDate(e.target.value)}
            options={[
              { value: 'any', label: 'Any Date' },
              { value: '24h', label: 'Last 24 hours' },
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
            ]}
          />
        </div>

        {/* Category */}
        <div>
          <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">Category</div>
          <Select
            value={category}
            onChange={e => setCategory(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              ...defaultCategories.map(c => ({ value: c.slug, label: c.name }))
            ]}
          />
        </div>

        {/* Advanced Items Details */}
        <div>
          <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5">Item Details</div>
          <div className="space-y-3">
            <Input 
              placeholder="Brand..." 
              value={brand}
              onChange={e => setBrand(e.target.value)}
            />
            <Input 
              placeholder="Colour..." 
              value={colour}
              onChange={e => setColour(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[var(--border-primary)] flex-shrink-0 bg-[var(--bg-primary)] z-10">
        <Button className="w-full h-10 text-sm font-medium" onClick={applyFilters}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

export function EmptySearchState() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSaveSearch = async () => {
    const params = new URLSearchParams(searchParams.toString());
    const query = params.get('q');
    const category = params.get('category');
    const locationName = params.get('locName');

    let nameParts = [];
    if (query) nameParts.push(`"${query}"`);
    if (category) nameParts.push(defaultCategories.find(c => c.slug === category)?.name || category);
    if (locationName) nameParts.push(`near ${locationName}`);
    
    const searchName = nameParts.length > 0 ? `Alert: ${nameParts.join(' ')}` : `Saved Search (${new Date().toLocaleDateString()})`;

    const input = {
      name: searchName,
      query: query || undefined,
      type: (params.get('type') as any) === 'all' ? 'all' : (params.get('type') as any) || 'all',
      categoryId: category || undefined,
      brand: params.get('brand') || undefined,
      colour: params.get('colour') || undefined,
      latitude: params.get('lat') ? parseFloat(params.get('lat') as string) : undefined,
      longitude: params.get('lng') ? parseFloat(params.get('lng') as string) : undefined,
      locationName: locationName || undefined,
      radius: params.get('radius') ? parseFloat(params.get('radius') as string) : undefined,
      datePreference: params.get('date') !== 'any' ? (params.get('date') as string) : undefined,
      alertsEnabled: true,
    };

    const result = await createSavedSearch(input);
    if (!result.success) {
      if (result.error === 'Unauthorized') {
        const callbackUrl = `/search?${params.toString()}`;
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      } else {
        alert(`Error: ${result.error}`);
      }
    } else {
      alert('Alert created! You will be notified of new matches.');
    }
  };

  return (
    <div className="p-16 text-center bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] shadow-sm">
      <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
        <Bell className="w-8 h-8 text-[var(--text-tertiary)]" />
      </div>
      <h3 className="text-xl font-bold mb-2">No items found</h3>
      <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
        We couldn't find any items matching your current filters. We'll notify you when a new matching listing is reported.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Button onClick={handleSaveSearch} className="px-8 shadow-md">
          Create an alert
        </Button>
        <Button variant="outline" onClick={() => router.push('/report/lost')}>
          Report my lost item
        </Button>
      </div>
    </div>
  );
}
