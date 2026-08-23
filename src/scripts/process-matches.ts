import { db } from '@/lib/db';
import { processMatchJob } from '@/lib/matching/processor';

async function main() {
  console.log('Fetching pending match jobs...');
  const jobs = await db.matchJob.findMany({
    where: {
      status: 'pending',
    },
    take: 50,
  });

  if (jobs.length === 0) {
    console.log('No pending jobs found.');
    return;
  }

  console.log(`Processing ${jobs.length} jobs...`);

  for (const job of jobs) {
    try {
      console.log(`Processing job ${job.id} for ${job.payload}...`);
      const result = await processMatchJob(job.id);
      if (result.success) {
        console.log(`✅ Success: ${result.matchesFound || 0} matches found.`);
      } else {
        console.log(`❌ Failed: ${result.error}`);
      }
    } catch (error) {
      console.error(`💥 Error processing job ${job.id}:`, error);
    }
  }

  console.log('Done processing match jobs.');
}

// Allow running via `npx ts-node --compiler-options "{\"module\":\"commonjs\"}" src/scripts/process-matches.ts`
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
