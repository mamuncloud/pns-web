export type EnumTaste = 'Pedas' | 'Gurih' | 'Manis';
export type EnumPackage = 'ES3' | 'ES4' | '250gr' | '500gr' | '1kg' | 'bal';

export interface ProductVariant {
  package: EnumPackage;
  price: number;
  stock?: number;
}

export type ProductStatus = 'Normal' | 'Warning' | 'Critical';

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  images?: ProductImage[];
  taste: EnumTaste[];
  variants: ProductVariant[];
  brandId?: string;
  brand?: {
    id: string;
    name: string;
  };
  status?: ProductStatus;
  margin?: number;
  currentHpp?: number;
  sellingPrice?: number;
  stockQty?: number;
  latestSupplier?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}
