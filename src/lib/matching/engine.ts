import { calculateDistance } from '@/lib/geo';

interface ItemForMatch {
  id: string;
  categoryId: string;
  title: string;
  publicDescription: string;
  brand?: string | null;
  colour?: string | null;
  model?: string | null;
  dateLost?: Date;
  dateFound?: Date;
  latitude?: number | null;
  longitude?: number | null;
}

export interface MatchScoreResult {
  score: number;
  confidence: 'strong' | 'possible' | 'weak';
  reasons: string[];
}

export function calculateMatchScore(lostItem: ItemForMatch, foundItem: ItemForMatch): MatchScoreResult {
  let score = 0;
  const reasons: string[] = [];

  // 1. Category (25 points)
  if (lostItem.categoryId === foundItem.categoryId) {
    score += 25;
    reasons.push('Exact category match');
  }

  // 2. Date (20 points)
  // Found date should logically be after or very close to lost date.
  if (lostItem.dateLost && foundItem.dateFound) {
    const diffMs = foundItem.dateFound.getTime() - lostItem.dateLost.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    // Allow up to 1 day before (timezone drift/estimation), up to 30 days after
    if (diffDays >= -1 && diffDays <= 30) {
      if (diffDays <= 3) {
        score += 20;
        reasons.push('Dates are very close');
      } else if (diffDays <= 7) {
        score += 15;
        reasons.push('Dates are within a week');
      } else {
        score += 10;
        reasons.push('Dates are compatible');
      }
    } else {
      // Incompatible dates severely penalize the score
      score -= 50; 
      reasons.push('Date incompatibility');
    }
  }

  // 3. Location (25 points)
  if (lostItem.latitude && lostItem.longitude && foundItem.latitude && foundItem.longitude) {
    const distanceKm = calculateDistance(
      lostItem.latitude, lostItem.longitude,
      foundItem.latitude, foundItem.longitude
    );
    
    if (distanceKm <= 1) {
      score += 25;
      reasons.push(`Reported very close (${distanceKm.toFixed(1)} km apart)`);
    } else if (distanceKm <= 5) {
      score += 20;
      reasons.push(`Reported nearby (${distanceKm.toFixed(1)} km apart)`);
    } else if (distanceKm <= 20) {
      score += 10;
      reasons.push(`Reported in the same region (${distanceKm.toFixed(1)} km apart)`);
    } else if (distanceKm > 50) {
      score -= 20;
      reasons.push(`Reported far apart (${distanceKm.toFixed(1)} km)`);
    }
  }

  // 4. Brand & Model (15 points)
  const lBrand = (lostItem.brand || '').toLowerCase().trim();
  const fBrand = (foundItem.brand || '').toLowerCase().trim();
  
  if (lBrand && fBrand) {
    if (lBrand === fBrand || lBrand.includes(fBrand) || fBrand.includes(lBrand)) {
      score += 10;
      reasons.push('Brand match');
    } else {
      score -= 10;
      reasons.push('Brand mismatch');
    }
  }

  const lModel = (lostItem.model || '').toLowerCase().trim();
  const fModel = (foundItem.model || '').toLowerCase().trim();
  
  if (lModel && fModel) {
    if (lModel === fModel || lModel.includes(fModel) || fModel.includes(lModel)) {
      score += 5;
      reasons.push('Model match');
    }
  }

  // 5. Colour (5 points)
  const lColour = (lostItem.colour || '').toLowerCase().trim();
  const fColour = (foundItem.colour || '').toLowerCase().trim();
  
  if (lColour && fColour) {
    if (lColour === fColour || lColour.includes(fColour) || fColour.includes(lColour)) {
      score += 5;
      reasons.push('Colour match');
    }
  }

  // 6. Text Similarity (10 points)
  const lWords = new Set([
    ...lostItem.title.toLowerCase().split(/\W+/),
    ...lostItem.publicDescription.toLowerCase().split(/\W+/)
  ].filter(w => w.length > 3));

  const fWords = new Set([
    ...foundItem.title.toLowerCase().split(/\W+/),
    ...foundItem.publicDescription.toLowerCase().split(/\W+/)
  ].filter(w => w.length > 3));

  let overlap = 0;
  for (const word of lWords) {
    if (fWords.has(word)) overlap++;
  }
  
  if (overlap >= 3) {
    score += 10;
    reasons.push('Strong text description overlap');
  } else if (overlap > 0) {
    score += 5;
    reasons.push('Some text description overlap');
  }

  // Constrain score
  score = Math.max(0, Math.min(100, score));

  let confidence: 'strong' | 'possible' | 'weak' = 'weak';
  if (score >= 70) confidence = 'strong';
  else if (score >= 40) confidence = 'possible';

  return { score, confidence, reasons };
}
