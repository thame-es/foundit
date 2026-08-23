import { calculateMatchScore } from '@/lib/matching/engine';

function assertScore(name: string, score: number, expectedMin: number, expectedMax: number) {
  if (score >= expectedMin && score <= expectedMax) {
    console.log(`✅ [PASS] ${name} (Score: ${score})`);
  } else {
    console.log(`❌ [FAIL] ${name} (Score: ${score}, Expected: ${expectedMin}-${expectedMax})`);
    process.exitCode = 1;
  }
}

function runTests() {
  const baseLost: any = {
    id: 'l1',
    categoryId: 'c1',
    title: 'Black iPhone 13',
    publicDescription: 'Lost my black iPhone 13 at the park.',
    brand: 'Apple',
    model: 'iPhone 13',
    colour: 'Black',
    dateLost: new Date('2023-10-01T12:00:00Z'),
    latitude: 51.5074,
    longitude: -0.1278,
  };

  const exactMatch: any = {
    id: 'f1',
    categoryId: 'c1',
    title: 'Found Apple iPhone 13',
    publicDescription: 'Found a black iPhone 13 in the park grass.',
    brand: 'Apple',
    model: 'iPhone 13',
    colour: 'Black',
    dateFound: new Date('2023-10-02T10:00:00Z'), // 1 day later
    latitude: 51.5076,
    longitude: -0.1279, // very close
  };

  const diffCategory: any = {
    ...exactMatch,
    categoryId: 'c2',
  };

  const diffDate: any = {
    ...exactMatch,
    dateFound: new Date('2023-09-01T10:00:00Z'), // Found BEFORE lost
  };

  const farLocation: any = {
    ...exactMatch,
    latitude: 40.7128, // NY
    longitude: -74.0060,
  };

  console.log('Running Matching Engine Tests...');

  let res = calculateMatchScore(baseLost, exactMatch);
  assertScore('Exact Match', res.score, 90, 100);

  res = calculateMatchScore(baseLost, diffCategory);
  assertScore('Different Category', res.score, 50, 75); // loses 25 pts

  res = calculateMatchScore(baseLost, diffDate);
  assertScore('Incompatible Date (Found before Lost)', res.score, 0, 40); // heavily penalized

  res = calculateMatchScore(baseLost, farLocation);
  assertScore('Far Location', res.score, 30, 60); // loses 25 pts + penalty

  console.log('Tests complete.');
}

runTests();
