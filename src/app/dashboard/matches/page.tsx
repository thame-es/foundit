import { requireAuth } from '@/lib/auth/guards';
import { db } from '@/lib/db';
import { PossibleMatchCard } from '@/components/dashboard/PossibleMatchCard';

export const metadata = {
  title: 'Possible Matches | FoundIt Dashboard',
};

export default async function MatchesPage() {
  const session = await requireAuth();

  // Find matches where the user is the owner of the lost item OR the owner of the found item
  const matches = await db.possibleMatch.findMany({
    where: {
      OR: [
        { lostItem: { userId: session.userId } },
        { foundItem: { userId: session.userId } }
      ],
      status: { notIn: ['expired'] } // don't show expired
    },
    include: {
      lostItem: {
        include: { images: { take: 1 } }
      },
      foundItem: {
        include: { images: { take: 1 } }
      }
    },
    orderBy: {
      score: 'desc'
    }
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Possible Matches</h1>
        <p className="text-[var(--text-secondary)]">
          We constantly scan the database to find items that match your listings. 
          A high score doesn't guarantee a match, but it's a good place to start.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border-primary)] p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[var(--bg-secondary)] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No matches found yet</h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            We haven't found any strong matches for your items yet. We'll keep looking and notify you if anything turns up.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map(match => {
            // Determine if the user owns the lost item or the found item
            const userOwnsLost = match.lostItem.userId === session.userId;
            
            // The item to display is the OTHER item (the one the user didn't post)
            const displayItem = userOwnsLost ? match.foundItem : match.lostItem;
            const type = userOwnsLost ? 'found' : 'lost';
            
            return (
              <PossibleMatchCard
                key={match.id}
                matchId={match.id}
                score={match.score}
                confidence={match.confidence}
                reasons={JSON.parse(match.reasons)}
                status={match.status}
                item={{
                  title: displayItem.title,
                  slug: displayItem.slug,
                  type,
                  locationString: [displayItem.area, displayItem.city].filter(Boolean).join(', '),
                  date: type === 'found' ? (displayItem as any).dateFound : (displayItem as any).dateLost,
                  imageUrl: displayItem.images?.[0]?.thumbnailPath || undefined
                }}
                onDismiss={async () => {
                  'use server';
                  // To be fully implemented with a server action in a real app, 
                  // but we mock the interface for now.
                }}
                onAction={async () => {
                  'use server';
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
