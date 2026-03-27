import { Product } from "@/types/product";
import { api } from "./api";

export interface InventorySummary {
  id: string;
  name: string;
  brand?: string;
  imageUrl?: string;
  totalStock: number;
  totalValue: number;
  variantCount: number;
  status: 'SAFE' | 'WARNING' | 'CRITICAL';
}

export interface InventoryBatch {
  id: string;
  label: string;
  stock: number;
  price: number;
  expiredDate?: string;
  daysUntilExpiry?: number | null;
  purchaseDate?: string;
  supplierName?: string;
  purchaseItemId?: string;
}

export interface ProductInventory {
  product: Product;
  batches: InventoryBatch[];
}

export async function getInventorySummary() {
  const response = await api.get<InventorySummary[]>('/inventory');
  return response;
}

export async function getProductInventory(productId: string) {
  const response = await api.get<ProductInventory>(`/inventory/${productId}`);
  return response;
}
