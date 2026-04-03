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
  package: string;
  qty: number;
  totalCost: number;
  extraCosts: number;
  unitCost: number;
  sellingPrice: number;
  expiredDate?: string;
  sizeInGram?: number;
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
    package: string;
    qty: number;
    totalCost: number;
    extraCosts: number;
    sellingPrice: number;
    expiredDate?: string;
    sizeInGram?: number;
  }[];
}

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
  type: 'EMPLOYEE' | 'USER';
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'MANAGER' | 'CASHIER';
  createdAt: string;
  phone?: string;
}

export interface CreateEmployeeDto {
  name: string;
  email: string;
  role: 'MANAGER' | 'CASHIER';
  phone?: string;
}

export type UpdateEmployeeDto = Partial<CreateEmployeeDto>;

export interface RepackItem {
  id: string;
  repackId: string;
  targetVariantId: string;
  targetVariant?: {
    id: string;
    package: string;
    sizeInGram?: number;
  };
  targetVariantPackage?: string; // Kept for backward compatibility/temp display if needed
  qtyProduced: number;
  sellingPrice: number;
  sizeInGram?: number;
  createdAt: string;
}

export interface Repack {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
  };
  sourceVariantId: string;
  sourceVariant?: {
    id: string;
    package: string;
    stock: number;
    price: number;
  };
  sourceQtyUsed: number;
  note?: string;
  createdAt: string;
  items: RepackItem[];
}

export interface CreateRepackDto {
  productId: string;
  sourceVariantId: string;
  sourceQtyUsed: number;
  note?: string;
  items: {
    targetVariantPackage: string;
    qtyProduced: number;
    sellingPrice: number;
    sizeInGram?: number;
  }[];
}
export type StockMovementType = 'PURCHASE' | 'SALE' | 'REPACK_SOURCE' | 'REPACK_TARGET' | 'ADJUSTMENT' | 'RETURN' | 'PURCHASE_REVERSAL' | 'SALE_REVERSAL';


export interface StockMovement {
  id: string;
  productVariantId: string;
  type: StockMovementType;
  quantity: number;
  balanceAfter: number;
  referenceId?: string;
  note?: string;
  createdBy: string;
  createdAt: string;
  productVariant?: {
    id: string;
    package: string;
    product?: {
      id: string;
      name: string;
    };
  };
  user?: {
    id: string;
    name: string;
  };
}

export interface AdjustStockDto {
  productVariantId: string;
  quantity: number;
  note?: string;
}

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'COMPLETED';
export type OrderType = 'WALK_IN' | 'PRE_ORDER';
export type PaymentMethod = 'CASH' | 'QRIS';

export interface OrderItem {
  id: string;
  orderId: string;
  productVariantId: string;
  pricingRuleId?: string;
  quantity: number;
  price: number;
  productVariant?: {
    id: string;
    package: string;
    product?: {
      id: string;
      name: string;
    };
  };
}

export interface Order {
  id: string;
  userId?: string;
  orderType: OrderType;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface CreateOrderDto {
  userId?: string;
  orderType: OrderType;
  paymentMethod?: PaymentMethod;
  paidAmount?: number;
  items: {
    productVariantId: string;
    quantity: number;
    price: number;
    pricingRuleId?: string;
  }[];
}
