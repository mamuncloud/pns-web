export type PricingType = 'WEIGHT' | 'FIXED_PRICE' | 'BULK';

export interface PricingRule {
  id: string;
  productId: string;
  type: PricingType;
  weightGram?: number;
  targetPrice?: number;
  marginPct: number;
  rounding: number;
  createdAt: string;
  updatedAt: string;
}

export type AdjustmentReason = 'DEFECT' | 'EXPIRED' | 'LOST' | 'RESTOCK' | 'PURCHASE';

export interface StockAdjustment {
  id: string;
  productId: string;
  qty: number;
  reason: AdjustmentReason;
  hppSnapshot: number;
  totalLoss: number;
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  variantLabel?: string;
  qty: number;
  totalCost: number;
  extraCosts?: number;
  sellingPrice?: number;
  expiredDate?: string;
}

export interface CreatePurchaseDto {
  supplierId: string;
  date: string;
  note?: string;
  items: PurchaseItem[];
}

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  type: 'EMPLOYEE' | 'USER';
}
