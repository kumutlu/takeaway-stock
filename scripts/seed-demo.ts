import { PrismaClient, StorageType, ProductStatus, OptionalType, Weekday } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const supplier = await prisma.supplier.upsert({
    where: { name: "Mediterranean Supplies" },
    update: {},
    create: { name: "Mediterranean Supplies" }
  });

  const brand = await prisma.brand.upsert({
    where: { name: "LEB+NOM" },
    update: {},
    create: { name: "LEB+NOM" }
  });

  await prisma.product.create({
    data: {
      supplierId: supplier.id,
      supplierName: supplier.name,
      brandId: brand.id,
      brandLabel: brand.name,
      brandTags: ["LEB+NOM"],
      itemName: "Tahini",
      storage: StorageType.AMBIENT,
      status: ProductStatus.ACTIVE,
      optionalNote: OptionalType.CORE,
      orderDay: Weekday.MONDAY,
      inventoryCheckDay: Weekday.THURSDAY,
      minimumOrder: 2,
      currentStock: 6,
      parLevel: 12,
      unit: "kg",
      isActive: true
    }
  });

  console.log("Seed complete");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
