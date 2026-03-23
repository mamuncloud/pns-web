import { db } from "./index";
import { products, productVariants } from "./schema";
import { dummyProducts } from "../lib/data/products";

async function seed() {
  console.log("Seeding database...");

  // clear existing
  await db.delete(products).execute();
  console.log("Cleared existing products");

  for (const p of dummyProducts) {
    // Insert product
    const [insertedProduct] = await db.insert(products).values({
      name: p.name,
      description: p.description,
      imageUrl: p.image_url,
      taste: p.taste,
      isActive: true,
    }).returning();

    console.log(`Inserted product: ${insertedProduct.name}`);

    // Insert variants
    for (const v of p.variants) {
      await db.insert(productVariants).values({
        productId: insertedProduct.id,
        label: v.package,
        price: v.price,
        stock: 100, // Default stock
      });
      console.log(`  Inserted variant: ${v.package} for ${insertedProduct.name}`);
    }
  }

  console.log("Seeding completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
