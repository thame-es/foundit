import { Metadata } from 'next';
import { getSavedSearches } from '@/actions/savedSearches';
import { SavedSearchesList } from './SavedSearchesList';

export const metadata: Metadata = {
  title: 'Saved Searches | Dashboard',
  description: 'Manage your saved searches and match alerts.',
};

export default async function SavedSearchesPage() {
  const result = await getSavedSearches();
  const searches = result.success ? result.searches : [];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[var(--text-primary)] mb-2">Saved Searches & Alerts</h1>
        <p className="text-[var(--text-secondary)]">
          Manage your saved filters. When an alert is enabled, we'll notify you if a new item matches your exact criteria.
        </p>
      </div>

      <SavedSearchesList initialSearches={searches} />
    </div>
  );
}
