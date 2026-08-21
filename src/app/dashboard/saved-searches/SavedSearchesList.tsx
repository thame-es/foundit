'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Trash2, Bell, BellOff, ExternalLink, Calendar, MapPin } from 'lucide-react';
import { deleteSavedSearch, toggleSavedSearchAlert } from '@/actions/savedSearches';
import Link from 'next/link';

export function SavedSearchesList({ initialSearches }: { initialSearches: any[] }) {
  const [searches, setSearches] = useState(initialSearches);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved search?')) return;
    setLoadingId(id);
    const res = await deleteSavedSearch(id);
    if (res.success) {
      setSearches(s => s.filter(search => search.id !== id));
    } else {
      alert(res.error);
    }
    setLoadingId(null);
  };

  const handleToggleAlert = async (id: string, current: boolean) => {
    setLoadingId(id);
    const res = await toggleSavedSearchAlert(id, !current);
    if (res.success) {
      setSearches(s => s.map(search => search.id === id ? { ...search, alertsEnabled: !current } : search));
    } else {
      alert(res.error);
    }
    setLoadingId(null);
  };

  if (searches.length === 0) {
    return (
      <div className="text-center py-16 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)]">
        <BellOff className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
        <h3 className="text-lg font-bold mb-2">No Saved Searches</h3>
        <p className="text-[var(--text-secondary)] mb-6">Save a search to get notified when matching items are found.</p>
        <Link href="/search">
          <Button>Go to Search</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {searches.map(search => {
        // Build the URL to run this search
        const params = new URLSearchParams();
        if (search.query) params.set('q', search.query);
        if (search.type !== 'all') params.set('type', search.type);
        if (search.categoryId) params.set('category', search.categoryId);
        if (search.brand) params.set('brand', search.brand);
        if (search.colour) params.set('colour', search.colour);
        if (search.latitude) params.set('lat', search.latitude.toString());
        if (search.longitude) params.set('lng', search.longitude.toString());
        if (search.locationName) params.set('locName', search.locationName);
        if (search.radius) params.set('radius', search.radius.toString());
        if (search.datePreference && search.datePreference !== 'any') params.set('date', search.datePreference);
        
        const searchUrl = `/search?${params.toString()}`;

        return (
          <div key={search.id} className="bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-primary)] p-6 flex flex-col hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-[var(--text-primary)]">{search.name}</h3>
              <Badge variant={search.alertsEnabled ? 'found' : 'secondary'}>
                {search.alertsEnabled ? 'Alerts On' : 'Paused'}
              </Badge>
            </div>

            <div className="flex-1 space-y-2 text-sm text-[var(--text-secondary)] mb-6">
              <div className="flex gap-2 flex-wrap">
                {search.query && <span className="px-2 py-1 bg-[var(--bg-secondary)] rounded-md font-medium text-[var(--text-primary)]">"{search.query}"</span>}
                {search.type !== 'all' && <span className="px-2 py-1 bg-[var(--bg-secondary)] rounded-md capitalize">{search.type} Items</span>}
              </div>
              
              {search.locationName && (
                <div className="flex items-center gap-1.5 mt-2">
                  <MapPin className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span>{search.locationName} (+{search.radius}km)</span>
                </div>
              )}
              
              {search.datePreference !== 'any' && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Calendar className="w-4 h-4 text-[var(--text-tertiary)]" />
                  <span>Date: {search.datePreference}</span>
                </div>
              )}
              
              <div className="text-xs text-[var(--text-tertiary)] pt-3">
                Created on {new Date(search.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-primary)]">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={loadingId === search.id}
                  onClick={() => handleToggleAlert(search.id, search.alertsEnabled)}
                >
                  {search.alertsEnabled ? <BellOff className="w-4 h-4 mr-1" /> : <Bell className="w-4 h-4 mr-1" />}
                  {search.alertsEnabled ? 'Pause' : 'Resume'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100"
                  disabled={loadingId === search.id}
                  onClick={() => handleDelete(search.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <Link href={searchUrl}>
                <Button variant="ghost" size="sm" className="text-[var(--color-primary-600)] font-medium">
                  Run Search <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
