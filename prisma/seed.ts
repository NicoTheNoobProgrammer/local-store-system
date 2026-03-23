import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 👤 Create seller
  const seller = await prisma.user.create({
    data: {
      email: "nicoseller@test.com",
      username: "nicoseller",
      password: "1234",
      role: "SELLER",
    },
  });
  
  

  // 🏪 Create store
  const store = await prisma.store.create({
    data: {
      name: "Butuan Plant Shop",
      category: "Plants",
      latitude: 8.9475,
      longitude: 125.5406,
      ownerId: seller.id,
    },
  });



  // 👤 Create test buyer
  const buyer = await prisma.user.create({
    data: {
      email: "buyer@test.com",
      username: "buyer123",
      password: "1234",
      role: "USER",
    },
  });

  console.log("🌱 Seeded marketplace data");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());