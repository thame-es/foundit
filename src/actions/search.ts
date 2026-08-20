// ===========================================
// FoundIt — Global Search Operations
// ===========================================

import { db } from '@/lib/db';

interface SearchParams {
  query?: string;
  category?: string;
  type?: 'lost' | 'found' | 'all';
  status?: string;
}

export async function searchItems(params: SearchParams) {
  const { query, category, type = 'all', status = 'active' } = params;

  const baseFilter: any = { status };
  
  if (query) {
    baseFilter.OR = [
      { title: { contains: query } },
      { publicDescription: { contains: query } },
      { brand: { contains: query } },
    ];
  }

  if (category) {
    const cat = await db.category.findUnique({ where: { slug: category } });
    if (cat) {
      baseFilter.categoryId = cat.id;
    }
  }

  try {
    let lostItems: any[] = [];
    let foundItems: any[] = [];

    if (type === 'all' || type === 'lost') {
      lostItems = await db.lostItem.findMany({
        where: baseFilter,
        include: { category: true, images: { take: 1 } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    }

    if (type === 'all' || type === 'found') {
      foundItems = await db.foundItem.findMany({
        where: baseFilter,
        include: { category: true, images: { take: 1 } },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    }

    // Combine and sort by date for 'all'
    let results = [
      ...lostItems.map(i => ({ ...i, itemType: 'lost' })),
      ...foundItems.map(i => ({ ...i, itemType: 'found' }))
    ];

    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return { success: true, results };
  } catch (error) {
    console.error('Search error:', error);
    return { success: false, error: 'Failed to perform search' };
  }
}
