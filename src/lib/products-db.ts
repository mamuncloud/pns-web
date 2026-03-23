import { api } from "./api";
import { EnumTaste, EnumPackage, Product } from "@/types/product";
import { getProductImageUrl } from "./utils";

// Types from the backend
interface BackendProduct {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  taste: string[];
  isActive: boolean;
  variants: Array<{
    id: string;
    label: string;
    price: number;
    stock: number;
  }>;
}

export async function getProductsFromDb(): Promise<Product[]> {
  try {
    const response = await api.get<BackendProduct[]>("/products");
    
    if (!response.success) return [];

    // Map Backend format to Frontend compatible format
    return response.data.map((p) => ({
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
    console.error("Error in getProductsFromDb (API):", error);
    return [];
  }
}

export async function getProductByIdFromDb(id: string): Promise<Product | null> {
  try {
    const response = await api.get<BackendProduct>(`/products/${id}`);
    
    if (!response.success || !response.data) return null;

    const product = response.data;

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
    console.error("Error in getProductByIdFromDb (API):", error);
    return null;
  }
}
