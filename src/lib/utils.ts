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

export function formatWeight(gram: number | null | undefined): string {
  if (!gram) return "—";
  if (gram >= 1000) {
    const kg = gram / 1000;
    return `${Number.isInteger(kg) ? kg : kg.toFixed(1)}KG`;
  }
  return `${gram}GR`;
}

/**
 * Checks if the current environment is a mobile device based on user agent.
 * Useful for handling platform-specific behaviors like deep-linking delays.
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}
