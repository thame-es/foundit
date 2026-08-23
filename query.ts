import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const items = await prisma.itemImage.findMany({ orderBy: { createdAt: 'desc' }, take: 2 });
  console.log(items);
}
main().catch(console.error).finally(() => prisma.$disconnect());
