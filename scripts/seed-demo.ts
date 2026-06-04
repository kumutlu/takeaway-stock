import { PrismaClient, StorageType, ProductStatus, OptionalType, Weekday } from "@prisma/client";

const prisma = new PrismaClient();
const LEGACY_PROJECT_CODE = "WRAPNBOWL";

async function main() {
  const project = await prisma.project.findUniqueOrThrow({ where: { code: LEGACY_PROJECT_CODE } });
  const supplier = await prisma.supplier.upsert({
    where: { projectId_name: { projectId: project.id, name: "Mediterranean Supplies" } },
    update: {},
    create: { projectId: project.id, name: "Mediterranean Supplies" }
  });

  const brand = await prisma.brand.upsert({
    where: { projectId_name: { projectId: project.id, name: "LEB+NOM" } },
    update: {},
    create: { projectId: project.id, name: "LEB+NOM" }
  });

  await prisma.product.create({
    data: {
      projectId: project.id,
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
