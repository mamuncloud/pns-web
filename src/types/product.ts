export type EnumTaste = 'Pedas' | 'Gurih' | 'Manis';
export type EnumPackage = '250gr' | '500gr' | '1kg' | 'Medium' | 'Small' | 'Grocery';

export interface ProductVariant {
  package: EnumPackage;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  taste: EnumTaste[];
  variants: ProductVariant[];
}
