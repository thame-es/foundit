// ===========================================
// FoundIt — Global Search Operations
// ===========================================

import { db } from '@/lib/db';
import { calculateDistance, getBoundingBox } from '@/lib/geo';

export interface SearchParams {
  query?: string;
  category?: string;
  type?: 'lost' | 'found' | 'all';
  status?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  date?: string; // '24h', '7d', '30d', 'custom', 'any'
  startDate?: string;
  endDate?: string;
  brand?: string;
  colour?: string;
  sort?: 'best_match' | 'nearest' | 'newest' | 'recent_date';
  page?: number;
}

export async function searchItems(params: SearchParams) {
  const { 
    query, category, type = 'all', status = 'active', 
    lat, lng, radius, date, startDate, endDate,
    brand, colour, sort = 'newest', page = 1
  } = params;

  const pageSize = 50;
  const skip = (page - 1) * pageSize;

  const baseFilter: any = {};
  if (status && status !== 'all') {
    baseFilter.status = status;
  } else {
    // Hide completed listings from generic searches
    baseFilter.status = { notIn: ['recovered', 'returned', 'hidden', 'expired'] };
  }
  
  // 1. Text Search
  if (query) {
    const trimmedQuery = query.trim();
    baseFilter.OR = [
      { title: { contains: trimmedQuery, mode: 'insensitive' } },
      { publicDescription: { contains: trimmedQuery, mode: 'insensitive' } },
      { brand: { contains: trimmedQuery, mode: 'insensitive' } },
      { model: { contains: trimmedQuery, mode: 'insensitive' } },
      { colour: { contains: trimmedQuery, mode: 'insensitive' } },
      { area: { contains: trimmedQuery, mode: 'insensitive' } },
      { city: { contains: trimmedQuery, mode: 'insensitive' } },
      { region: { contains: trimmedQuery, mode: 'insensitive' } },
    ];
  }

  // 2. Category
  if (category) {
    const cat = await db.category.findUnique({ where: { slug: category } });
    if (cat) {
      baseFilter.categoryId = cat.id;
    }
  }

  // 3. Item Properties
  if (brand) {
    baseFilter.brand = { contains: brand.trim(), mode: 'insensitive' };
  }
  if (colour) {
    baseFilter.colour = { contains: colour.trim(), mode: 'insensitive' };
  }

  // 4. Bounding Box Optimization
  if (lat !== undefined && lng !== undefined && radius) {
    const bbox = getBoundingBox(lat, lng, radius);
    baseFilter.latitude = { gte: bbox.minLat, lte: bbox.maxLat };
    baseFilter.longitude = { gte: bbox.minLng, lte: bbox.maxLng };
  }

  try {
    let lostItems: any[] = [];
    let foundItems: any[] = [];

    const lostFilter = { ...baseFilter };
    const foundFilter = { ...baseFilter };

    if (date && date !== 'any') {
      const now = new Date();
      let fromDate: Date | undefined;
      
      if (date === '24h') fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      else if (date === '7d') fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      else if (date === '30d') fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      else if (date === 'custom' && startDate && endDate) {
        lostFilter.dateLost = { gte: new Date(startDate), lte: new Date(endDate) };
        foundFilter.dateFound = { gte: new Date(startDate), lte: new Date(endDate) };
      }

      if (fromDate) {
        lostFilter.dateLost = { gte: fromDate };
        foundFilter.dateFound = { gte: fromDate };
      }
    }

    // We fetch a larger batch so manual filtering and sorting on JS side works effectively 
    // for small bounding boxes. If no radius, we could rely on Prisma skip/take entirely.
    const fetchLimit = (lat !== undefined && lng !== undefined && radius) ? 1000 : skip + pageSize;

    if (type === 'all' || type === 'lost') {
      lostItems = await db.lostItem.findMany({
        where: lostFilter,
        include: { category: true, images: { take: 1 } },
        orderBy: (sort === 'newest' || sort === 'best_match') ? { createdAt: 'desc' } : sort === 'recent_date' ? { dateLost: 'desc' } : undefined,
        take: fetchLimit,
      });
    }

    if (type === 'all' || type === 'found') {
      foundItems = await db.foundItem.findMany({
        where: foundFilter,
        include: { category: true, images: { take: 1 } },
        orderBy: (sort === 'newest' || sort === 'best_match') ? { createdAt: 'desc' } : sort === 'recent_date' ? { dateFound: 'desc' } : undefined,
        take: fetchLimit,
      });
    }

    let results = [
      ...lostItems.map(i => ({ ...i, itemType: 'lost', itemDate: i.dateLost })),
      ...foundItems.map(i => ({ ...i, itemType: 'found', itemDate: i.dateFound }))
    ];

    // 5. Precise Distance Calculation & Filtering
    if (lat !== undefined && lng !== undefined) {
      results = results.map(item => {
        if (item.latitude && item.longitude) {
          const dist = calculateDistance(lat, lng, item.latitude, item.longitude);
          return { ...item, distance: dist };
        }
        return { ...item, distance: Infinity };
      });
      
      if (radius) {
        results = results.filter(item => item.distance <= radius);
      }
    }

    // 6. Sorting
    if (sort === 'nearest' && lat !== undefined && lng !== undefined) {
      results.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    } else if (sort === 'recent_date') {
      results.sort((a, b) => b.itemDate.getTime() - a.itemDate.getTime());
    } else if (sort === 'newest' || sort === 'best_match') {
      results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // 7. Pagination
    const paginatedResults = results.slice(skip, skip + pageSize);
    const hasMore = results.length > skip + pageSize;

    return { success: true, results: paginatedResults, hasMore };
  } catch (error) {
    console.error('Search error:', error);
    return { success: false, error: 'Failed to perform search' };
  }
}
