export type EnumTaste = 'Pedas' | 'Gurih' | 'Manis';
export type EnumPackage = '250gr' | '500gr' | '10rb' | '5rb' | 'bal' | '1kg';

export interface ProductVariant {
  package: EnumPackage;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image_url: string;
  taste: EnumTaste;
  variants: ProductVariant[];
}
