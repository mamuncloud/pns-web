import { Product, EnumTaste, EnumPackage } from "@/types/product";

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch("http://localhost:3000/api/products", {
      next: { revalidate: 60 } // Cache for 1 minute
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.statusText}`);
    }
    
    const data = await res.json();
    
    // Map Drizzle/Elysia format to Frontend compatible format
    return data.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description || "",
      image_url: getProductImageUrl(p.imageUrl || ""),
      taste: p.taste as EnumTaste[],
      variants: p.variants.map((v: any) => ({
        package: v.label as EnumPackage,
        price: v.price
      }))
    }));
  } catch (error) {
    console.error("Error in getProducts:", error);
    return [];
  }
}

export function getProductImageUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `https://szaprhbdfkxrcoxuaogl.supabase.co/storage/v1/object/public/products/${path}`;
}
