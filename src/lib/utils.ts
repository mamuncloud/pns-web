import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProductImageUrl(path: string | null | undefined): string {
  const defaultImage = "https://szaprhbdfkxrcoxuaogl.supabase.co/storage/v1/object/public/products/product_default.png";
  if (!path) return defaultImage;
  if (path.startsWith("http")) return path;
  return `https://szaprhbdfkxrcoxuaogl.supabase.co/storage/v1/object/public/products/${path}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
