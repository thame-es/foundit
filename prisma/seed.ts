import { PrismaClient } from '@prisma/client';
import { defaultCategories } from '../src/lib/config';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding categories...');
  
  for (const category of defaultCategories) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug }
    });
    
    if (!existing) {
      await prisma.category.create({
        data: {
          name: category.name,
          slug: category.slug,
          icon: category.icon,
          description: category.description,
          order: category.order,
          sensitive: category.sensitive || false,
        }
      });
      console.log(`Created category: ${category.name}`);
    } else {
      console.log(`Category already exists: ${category.name}`);
    }
  }
  
  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
