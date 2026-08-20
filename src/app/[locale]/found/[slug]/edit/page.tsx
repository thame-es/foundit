import { db } from '@/lib/db';
import { requireFoundItemOwnership } from '@/lib/auth/guards';
import { notFound } from 'next/navigation';
import { ReportForm } from '@/components/forms/ReportForm';

export default async function EditFoundItemPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = await params;
  const item = await db.foundItem.findUnique({
    where: { slug: resolvedParams.slug },
    include: { images: true }
  });

  if (!item) {
    notFound();
  }

  // Ensure only the owner or an admin can access this page
  await requireFoundItemOwnership(item.id);

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Edit Found Item</h1>
        <p className="text-[var(--text-secondary)] mt-2">Update the details for "{item.title}"</p>
      </div>

      <div className="bg-[var(--bg-primary)] rounded-2xl shadow-sm border border-[var(--border-primary)] overflow-hidden">
        <ReportForm type="found" itemId={item.id} initialData={item} />
      </div>
    </div>
  );
}
