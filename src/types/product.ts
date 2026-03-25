export type EnumTaste = 'Pedas' | 'Gurih' | 'Manis';
export type EnumPackage = '250gr' | '500gr' | '1kg' | 'Medium' | 'Small' | 'Grocery';

export interface ProductVariant {
  package: EnumPackage;
  price: number;
  stock?: number;
}

export type ProductStatus = 'Normal' | 'Warning' | 'Critical';

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  taste: EnumTaste[];
  variants: ProductVariant[];
  brandId?: string;
  sellingPrice: number;
  currentHpp: number;
  stockQty: number;
  baseCostPerGram: number;
  packagingCost: number;
  status?: ProductStatus;
  margin?: number;      // Calculated client-side or from API
  priceChangePercentage?: number;
  createdAt: string;
  updatedAt: string;
}
