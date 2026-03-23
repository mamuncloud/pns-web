import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getProductImageUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `https://szaprhbdfkxrcoxuaogl.supabase.co/storage/v1/object/public/products/${path}`;
}
