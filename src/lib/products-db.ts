import { api } from "./api";
import { EnumTaste, EnumPackage, Product, ProductStatus, ProductVariant } from "@/types/product";

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
  brand?: {
    id: string;
    name: string;
  };
  taste: string[];
  isActive: boolean;
  status?: string;
  currentHpp?: number;
  createdAt: string;

  updatedAt: string;
  variants: Array<{
    id: string;
    package: string;
    price: number;
    hpp: number;
    stock: number;
    sku?: string;
    sizeInGram?: number;
    expiredDate?: string;
    purchaseItem?: ProductVariant['purchaseItem'];
  }>;
  images?: Array<{
    id: string;
    url: string;
    isPrimary: boolean;
    createdAt: string;
  }>;
  latestSupplier?: {
    id: string;
    name: string;
  } | null;
}

type BackendVariant = BackendProduct['variants'][number];

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const response = await api.get<BackendProduct>(`/products/${id}`);
    
    if (!response.success || !response.data) {
      return null;
    }

    const p = response.data;
    return {
      id: p.id,
      name: p.name,
      description: p.description || "",
      imageUrl: p.imageUrl || "",
      images: p.images || [],
      taste: (p.taste || []) as EnumTaste[],
      brandId: p.brandId || undefined,
      brand: p.brand || undefined,
      latestSupplier: p.latestSupplier || undefined,
      variants: (p.variants || []).map((v: BackendVariant) => ({
        id: v.id,
        package: v.package as EnumPackage,
        price: v.price,
        hpp: v.hpp || 0,
        stock: v.stock,
        sku: v.sku,
        sizeInGram: v.sizeInGram,
        expiredDate: v.expiredDate,
        purchaseItem: v.purchaseItem,
      })),
      sellingPrice: p.variants?.[0]?.price || 0,
      currentHpp: p.currentHpp || 0,
      stockQty: (p.variants || []).reduce((acc, v) => acc + (v.stock || 0), 0),
      margin: 35,
      status: (p.status || 'Normal') as ProductStatus,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };

  } catch (error) {
    console.error(`Error in getProductById for ${id}:`, error);
    return null;
  }
}

export async function getProductsFromDb(page: number = 1, limit: number = 12, taste?: string, search?: string, hasStock?: boolean): Promise<PaginatedProducts> {
  try {
    let url = `/products?page=${page}&limit=${limit}`;
    if (taste) url += `&taste=${taste}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (hasStock !== undefined) url += `&hasStock=${hasStock}`;
    
    const response = await api.get<BackendProduct[]>(url);
    
    if (!response.success) {
      return { 
        data: [], 
        meta: { page, limit, totalItems: 0, totalPages: 0 } 
      };
    }

    // Map Backend format to Frontend compatible format
    const products = response.data.map((p): Product => {
      return {
        id: p.id,
        name: p.name,
        description: p.description || "",
        imageUrl: p.imageUrl || "", // Now comes normalized from backend
        images: p.images || [],
        taste: (p.taste || []) as EnumTaste[],
        brandId: p.brandId || undefined,
        brand: p.brand || undefined,
        latestSupplier: p.latestSupplier || undefined,
        variants: (p.variants || []).map((v: BackendVariant) => ({
          id: v.id,
          package: v.package as EnumPackage,
          price: v.price,
          hpp: v.hpp || 0,
          stock: v.stock,
          sku: v.sku,
          sizeInGram: v.sizeInGram,
          expiredDate: v.expiredDate,
          purchaseItem: v.purchaseItem,
        })),
        sellingPrice: p.variants?.[0]?.price || 0,
        currentHpp: p.currentHpp || 0,
        stockQty: (p.variants || []).reduce((acc, v) => acc + (v.stock || 0), 0),
        margin: 35, // Default margin for now since backend doesn't provide it yet
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
