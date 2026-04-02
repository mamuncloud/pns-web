"use client";

import { useEffect, useState, use } from "react";
import { getProductById } from "@/lib/products-db";
import { Product, ProductImage, EnumTaste } from "@/types/product";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VariantCreateDialog } from "@/components/dashboard/products/VariantCreateDialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Breadcrumbs } from "@/components/dashboard/Breadcrumbs";
import { StockMovementList } from "@/components/dashboard/stock/StockMovementList";
import {
  ArrowLeft,
  Package,
  Tag,
  Scissors,
  Image as ImageIcon,
  TrendingUp,
  Lightbulb,
  MapPin,
  FileText,
  History,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn, getProductImageUrl, formatCurrency, formatWeight } from "@/lib/utils";
import { ProductEditDialog } from "@/components/dashboard/products/ProductEditDialog";

function ProductImageGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  if (images.length > 1) {
    return (
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={image.id || index}>
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900">
                <Image
                  src={image.url}
                  alt={`${productName} - image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    );
  }

  return (
    <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900">
      <Image
        src={images[0].url}
        alt={productName}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
      {!images[0].url.includes("placeholder") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/50 bg-gray-100/50 dark:bg-gray-800/50">
          <ImageIcon className="h-10 w-10 mb-2" />
          <span className="text-xs">No product image</span>
        </div>
      )}
    </div>
  );
}

function ProductInsightsCard({ product }: { product: Product }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-amber-500" />
          </div>
          <CardTitle className="text-base">Product Insights</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {product.latestSupplier && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Latest Supplier
            </p>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm">{product.latestSupplier.name}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Description
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description || "No description available for this product."}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            Taste Profile
          </p>
          <div className="flex flex-wrap gap-2">
            {product.taste.map((t: EnumTaste, idx: number) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductStockCard({ product }: { product: Product }) {
  const totalStock = product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);

  return (
    <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-indigo-100">Total Stock</p>
            <p className="text-3xl">{totalStock.toLocaleString("id-ID")} pcs</p>
          </div>
          <TrendingUp className="h-10 w-10 text-indigo-200/50" />
        </div>
        <div className="mt-4 pt-4 border-t border-indigo-400/30">
          <div className="flex items-center justify-between text-xs text-indigo-100">
            <span>Variants</span>
            <span className="">{product.variants.length}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const refreshProduct = async () => {
    const p = await getProductById(resolvedParams.id);
    setProduct(p);
  };

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      const p = await getProductById(resolvedParams.id);
      setProduct(p);
      setIsLoading(false);
    }
    fetchProduct();
  }, [resolvedParams.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Package className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-lg">Product not found</p>
        <Link href="/dashboard/products">
          <Button variant="outline">Back to Products</Button>
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ url: product.imageUrl || getProductImageUrl(null), id: "default", isPrimary: true } as ProductImage];

  return (
    <div className="space-y-6 pb-10">
      <Breadcrumbs
        items={[
          { label: "Products", href: "/dashboard/products" },
          { label: product.name }
        ]}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/products">
            <Button variant="ghost" size="icon" className="mt-1">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {product.brand?.name || "No Brand"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {product.id.split("-")[0]}
              </span>
            </div>
            <h1 className="text-3xl tracking-tight">{product.name}</h1>
            <div className="flex flex-wrap gap-2">
              {product.taste.map((t: EnumTaste, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  #{t}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <Button variant="outline" className="gap-2" onClick={() => setIsEditing(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Link href={`/dashboard/repacks?productId=${product.id}`}>
            <Button variant="outline" className="gap-2">
              <Scissors className="h-4 w-4" />
              Pecah Produk
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Variants & Stock History */}
        <div className="lg:col-span-2 space-y-8">
          {/* Variants Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Product Variants</CardTitle>
                <CardDescription>
                  Stock levels and pricing for each variant
                </CardDescription>
              </div>
              <VariantCreateDialog productId={product.id} onSuccess={refreshProduct} />
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-xs text-muted-foreground">
                        Packaging
                      </th>
                      <th className="text-left py-3 px-4 text-xs text-muted-foreground">
                        Stock
                      </th>
                      <th className="text-left py-3 px-4 text-xs text-muted-foreground">
                        Selling Price
                      </th>
                      <th className="text-left py-3 px-4 text-xs text-muted-foreground">
                        Size
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v, idx: number) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{v.package}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "h-2 w-2 rounded-full",
                              (v.stock || 0) > 10 ? "bg-emerald-500" : (v.stock || 0) > 0 ? "bg-amber-500" : "bg-red-500"
                            )} />
                            <span className="text-sm">{v.stock || 0}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">{formatCurrency(v.price)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">{formatWeight(v.sizeInGram)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Stock History Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Stock History</h2>
            </div>
            <StockMovementList productId={product.id} />
          </div>
        </div>

        {/* Right Column - Image & Insights */}
        <div className="space-y-6">
          <ProductImageGallery images={images} productName={product.name} />
          <ProductInsightsCard product={product} />
          <ProductStockCard product={product} />
        </div>
      </div>

      {product && (
        <ProductEditDialog
          product={product}
          open={isEditing}
          onOpenChange={setIsEditing}
          onSuccess={refreshProduct}
        />
      )}
    </div>
  );
}
