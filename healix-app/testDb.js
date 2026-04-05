const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const summaries = await prisma.aISummary.findMany();
  console.log('Total summaries:', summaries.length);
  if (summaries.length > 0) {
    console.log(summaries[0]);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
