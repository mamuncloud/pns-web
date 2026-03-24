import { api } from "./api";
import { EnumTaste, EnumPackage, Product } from "@/types/product";
import { getProductImageUrl } from "./utils";

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedProducts {
  data: Product[];
  meta: PaginationMeta;
}

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

export async function getProductsFromDb(page: number = 1, limit: number = 12, taste?: string): Promise<PaginatedProducts> {
  try {
    let url = `/products?page=${page}&limit=${limit}`;
    if (taste) url += `&taste=${taste}`;
    
    const response = await api.get<BackendProduct[]>(url);
    
    if (!response.success) {
      return { 
        data: [], 
        meta: { page, limit, totalItems: 0, totalPages: 0 } 
      };
    }

    // Map Backend format to Frontend compatible format
    const products = response.data.map((p) => ({
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

    const meta = response.meta as unknown as PaginationMeta;

    return {
      data: products,
      meta: meta || { page, limit, totalItems: 0, totalPages: 0 }
    };
  } catch (error) {
    console.error("Error in getProductsFromDb (API):", error);
    return { 
      data: [], 
      meta: { page, limit, totalItems: 0, totalPages: 0 } 
    };
  }
}
