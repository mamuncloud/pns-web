import Image from "next/image";
import { Product } from "@/types/product";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const formatRupiah = (price: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
};

const tasteColors = {
  Pedas: "bg-[#C62828] text-white hover:bg-[#B71C1C]",
  Gurih: "bg-[#F57F17] text-white hover:bg-[#E65100]",
  Manis: "bg-[#4CAF50] text-white hover:bg-[#388E3C]",
};

export default function ProductCard({ product }: { product: Product }) {
  // Sort variants by price to find lowest price
  const sortedVariants = [...product.variants].sort((a, b) => a.price - b.price);
  const lowestPrice = sortedVariants[0]?.price || 0;
  const isMultipleVariants = sortedVariants.length > 1;

  return (
    <Card className="rounded-[2rem] overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full bg-white p-0 gap-0">
      <div className="relative aspect-square w-full bg-[#f8f8f8] overflow-hidden">
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <Badge className={`${tasteColors[product.taste]} font-bold rounded-xl px-3 py-1 shadow-md border-0`}>
            {product.taste}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6 flex flex-col flex-grow">
        <h3 className="font-headline text-2xl font-bold text-dark mb-2 leading-tight">
          {product.name}
        </h3>
        
        <p className="text-on-background/60 text-sm mb-4 flex-grow line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        
        <div className="mb-4">
          <span className="font-bold text-primary text-xl block">
            {isMultipleVariants ? "Mulai dari " : ""}{formatRupiah(lowestPrice)}
          </span>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-auto">
          {product.variants.map((v) => (
            <span 
              key={v.package} 
              className="px-3 py-1.5 bg-[#FDF2F2] rounded-full text-[10px] font-bold text-primary"
            >
              {v.package}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
