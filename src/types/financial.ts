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
  id: string;
  purchaseId: string;
  productId: string;
  variantLabel: string;
  qty: number;
  totalCost: number;
  extraCosts: number;
  unitCost: number;
  sellingPrice: number;
  expiredDate?: string;
  product?: {
    id: string;
    name: string;
    brandId?: string;
    brand?: {
      id: string;
      name: string;
    };
    variants: {
      package: string;
      price: number;
      stock?: number;
    }[];
  };
}

export interface Purchase {
  id: string;
  supplierId: string;
  date: string;
  totalAmount: number;
  note?: string;
  status: 'DRAFT' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  supplier?: {
    id: string;
    name: string;
  };
  items?: PurchaseItem[];
}

export interface CreatePurchaseDto {
  supplierId: string;
  date: string;
  note?: string;
  status: 'DRAFT' | 'COMPLETED';
  items: {
    productId: string;
    variantLabel: string;
    qty: number;
    totalCost: number;
    extraCosts: number;
    sellingPrice: number;
    expiredDate?: string;
  }[];
}

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  type: 'EMPLOYEE' | 'USER';
}
