import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // Example: insert some demo data for classmates
  await prisma.players.createMany({
    data: [
      { id: 1, name: "LeBron James" },
      { id: 2, name: "Stephen Curry" },
      { id: 3, name: "Giannis Antetokounmpo" },
    ],
    skipDuplicates: true, // avoids duplicate key errors
  });

  console.log("✅ Seed complete: demo players inserted.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
