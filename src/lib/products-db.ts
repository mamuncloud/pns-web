import { api } from "./api";
import { EnumTaste, EnumPackage, Product, ProductStatus } from "@/types/product";
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
  brandId: string | null;
  taste: string[];
  isActive: boolean;
  sellingPrice: number;
  currentHpp: number;
  stockQty: number;
  baseCostPerGram: number;
  packagingCost: number;
  status?: string;
  createdAt: string;
  updatedAt: string;
  variants: Array<{
    id: string;
    label: string;
    price: number;
    stock: number;
  }>;
  images?: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
    createdAt: string;
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
    const products = response.data.map((p): Product => {
      // Calculate margin based on sellingPrice and currentHpp
      const margin = p.sellingPrice > 0 
        ? ((p.sellingPrice - p.currentHpp) / p.sellingPrice) * 100 
        : 0;

      return {
        id: p.id,
        name: p.name,
        description: p.description || "",
        imageUrl: p.imageUrl || "", // Now comes normalized from backend
        images: p.images || [],
        taste: (p.taste || []) as EnumTaste[],
        brandId: p.brandId || undefined,
        sellingPrice: p.sellingPrice,
        currentHpp: p.currentHpp,
        stockQty: p.stockQty,
        baseCostPerGram: p.baseCostPerGram,
        packagingCost: p.packagingCost,
        variants: (p.variants || []).map((v) => ({
          package: v.label as EnumPackage,
          price: v.price,
          stock: v.stock
        })),
        margin: margin,
        status: (p.status || 'Normal') as ProductStatus,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

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
