import { db } from "@/db";
import { EnumTaste, EnumPackage, Product } from "@/types/product";
import { getProductImageUrl } from "./utils";

export async function getProductsFromDb(): Promise<Product[]> {
  try {
    const data = await db.query.products.findMany({
      with: {
        variants: true,
      },
    });

    // Map Drizzle format to Frontend compatible format
    return data.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || "",
      image_url: getProductImageUrl(p.imageUrl || ""),
      taste: (p.taste || []) as EnumTaste[],
      variants: (p.variants || []).map((v) => ({
        package: v.label as EnumPackage,
        price: v.price
      }))
    }));
  } catch (error) {
    console.error("Error in getProductsFromDb:", error);
    return [];
  }
}

export async function getProductByIdFromDb(id: string): Promise<Product | null> {
  try {
    const product = await db.query.products.findFirst({
      where: (products, { eq }) => eq(products.id, id),
      with: {
        variants: true,
      },
    });

    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      description: product.description || "",
      image_url: getProductImageUrl(product.imageUrl || ""),
      taste: (product.taste || []) as EnumTaste[],
      variants: (product.variants || []).map((v) => ({
        package: v.label as EnumPackage,
        price: v.price
      }))
    };
  } catch (error) {
    console.error("Error in getProductByIdFromDb:", error);
    return null;
  }
}
