"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { compressImage } from "@/lib/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxInput,
  ComboboxEmpty,
  ComboboxList
} from "@/components/ui/combobox";
import { ImagePlus, Loader2, Plus, Star, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import NextImage from "next/image";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Brand {
  id: string;
  name: string;
}

interface ProductCreateFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductCreateForm({ onSuccess, onCancel }: ProductCreateFormProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [brandId, setBrandId] = useState<string | null>(null);
  const [brandSearch, setBrandSearch] = useState("");
  const [tastes, setTastes] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<{ file: File; preview: string; isPrimary: boolean }[]>([]);
  const [variants, setVariants] = useState<{ package: string; price: number; sku?: string; sizeInGram?: number }[]>([]);

  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await api.products.getBrands();
        setBrands(response.data);
      } catch (err) {
        console.error("Failed to fetch brands", err);
      } finally {
        setIsLoadingBrands(false);
      }
    }
    fetchBrands();
  }, []);

  const handleCreateBrand = async (brandName: string) => {
    if (!brandName.trim()) return;
    
    setIsCreatingBrand(true);
    try {
      const response = await api.products.createBrand(brandName.trim());
      const newBrand = response.data;
      
      // Update local brands list
      setBrands((prev) => [...prev, newBrand].sort((a, b) => a.name.localeCompare(b.name)));
      
      // Select the new brand
      setBrandId(newBrand.id);
      
      toast.success(`Brand "${newBrand.name}" berhasil dibuat`);
      setBrandSearch("");
    } catch (err) {
      console.error("Failed to create brand", err);
      toast.error("Gagal membuat brand baru. Silakan coba lagi.");
    } finally {
      setIsCreatingBrand(false);
    }
  };
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setIsSubmitting(true); // Temporarily show loading while compressing
      
      try {
        const compressedImages = await Promise.all(
          files.map(async (file, index) => {
            // Only compress if larger than 1MB
            let processedFile: File | Blob = file;
            if (file.size > 1024 * 1024) {
              const compressedBlob = await compressImage(file, 1600, 0.7);
              processedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
            }
            
            return {
              file: processedFile as File,
              preview: URL.createObjectURL(processedFile),
              isPrimary: selectedImages.length === 0 && index === 0,
            };
          })
        );
        setSelectedImages([...selectedImages, ...compressedImages]);
      } catch (err) {
        console.error("Compression failed", err);
        setError("Gagal memproses beberapa gambar. Silakan coba lagi dengan ukuran yang lebih kecil.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const deletedImage = selectedImages[index];
    URL.revokeObjectURL(deletedImage.preview);
    const newImages = selectedImages.filter((_, i) => i !== index);
    
    // If we removed the primary image, make the first one primary
    if (deletedImage.isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    
    setSelectedImages(newImages);
  };

  const togglePrimaryImage = (index: number) => {
    setSelectedImages(
      selectedImages.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !brandId || tastes.length === 0) {
      setError("Mohon isi semua field yang wajib (Nama, Brand, dan Minimal 1 Rasa)");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let imageUrls: string[] = [];
      
      // 1. Upload images if any
      if (selectedImages.length > 0) {
        try {
          const files = selectedImages.map(img => img.file);
          const response = await api.storage.uploadMultiple(files);
          imageUrls = response.data;
        } catch (uploadErr) {
          console.error("Image upload failed", uploadErr);
          throw new Error("Gagal mengunggah gambar. Produk tetap bisa dibuat tanpa gambar, atau silakan coba lagi.");
        }
      }

      // 2. Create product with image data
      await api.products.create({
        name,
        description,
        brandId: brandId || undefined,
        taste: tastes,
        images: imageUrls.map((url, index) => ({
          url,
          isPrimary: selectedImages[index].isPrimary
        })),
        variants: variants.map(v => ({
          package: v.package,
          price: v.price,
          sku: v.sku,
          sizeInGram: v.sizeInGram,
        }))
      });
      
      onSuccess();
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Gagal membuat produk. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const AVAILABLE_TASTES = [
    { label: "Gurih", value: "GURIH" },
    { label: "Pedas", value: "PEDAS" },
    { label: "Manis", value: "MANIS" },
  ];

  const toggleTaste = (value: string) => {
    if (tastes.includes(value)) {
      setTastes(tastes.filter((t) => t !== value));
    } else if (tastes.length < 3) {
      setTastes([...tastes, value]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Produk <span className="text-destructive">*</span></Label>
          <Input
            id="name"
            placeholder="Masukkan nama produk..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand">Brand <span className="text-destructive">*</span></Label>
          <Combobox
            value={brandId}
            onValueChange={setBrandId}
            inputValue={brandSearch}
            onInputValueChange={setBrandSearch}
            itemToStringLabel={(id: string) => brands.find(b => b.id === id)?.name || ""}
            disabled={isSubmitting || isLoadingBrands}
          >
            <ComboboxTrigger id="brand">
              <ComboboxInput 
                placeholder={isLoadingBrands ? "Memuat brand..." : "Cari brand..."} 
                className="w-full bg-transparent outline-none"
              />
            </ComboboxTrigger>
            <ComboboxContent>
              {brands.length === 0 && !isLoadingBrands ? (
                <div className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-3">Belum ada brand terdaftar.</p>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    className="w-full text-[10px] font-bold uppercase tracking-widest gap-2"
                    onClick={() => handleCreateBrand(brandSearch)}
                    disabled={isCreatingBrand || !brandSearch.trim()}
                  >
                    {isCreatingBrand ? <Loader2 className="size-3 animate-spin"/> : <Plus className="size-3"/>}
                    Tambah Brand &quot;{brandSearch || 'Baru'}&quot;
                  </Button>
                </div>
              ) : (
                <>
                  <ComboboxList className="max-h-60 overflow-y-auto p-1 space-y-0.5">
                    {brands.map((brand) => (
                      <ComboboxItem key={brand.id} value={brand.id} className="rounded-lg py-2 px-3 text-sm font-medium cursor-pointer hover:bg-primary/5">
                        {brand.name}
                      </ComboboxItem>
                    ))}
                  </ComboboxList>
                  <ComboboxEmpty className="p-0 border-t border-gray-100 dark:border-gray-800">
                    <div className="p-4 text-center">
                      <p className="text-xs text-muted-foreground mb-3">Brand &quot;{brandSearch}&quot; tidak ditemukan.</p>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        className="w-full text-[10px] font-bold uppercase tracking-widest gap-2"
                        onClick={() => handleCreateBrand(brandSearch)}
                        disabled={isCreatingBrand || !brandSearch.trim()}
                      >
                        {isCreatingBrand ? <Loader2 className="size-3 animate-spin"/> : <Plus className="size-3"/>}
                        Tambah Brand &quot;{brandSearch}&quot;
                      </Button>
                    </div>
                  </ComboboxEmpty>
                </>
              )}
            </ComboboxContent>
          </Combobox>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Textarea
            id="description"
            placeholder="Masukkan deskripsi produk..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-3">
          <Label>Media / Gambar Produk</Label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {selectedImages.map((img, index) => (
              <div 
                key={index} 
                className={cn(
                  "relative aspect-square rounded-md overflow-hidden border group",
                  img.isPrimary ? "border-primary ring-2 ring-primary/20" : "border-input"
                )}
              >
                <NextImage 
                  src={img.preview} 
                  alt={`Preview ${index}`} 
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                  unoptimized
                />
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => togglePrimaryImage(index)}
                    className={cn(
                      "p-1.5 rounded-full transition-colors",
                      img.isPrimary ? "bg-primary text-primary-foreground" : "bg-white/20 text-white hover:bg-white/40"
                    )}
                    title={img.isPrimary ? "Gambar Utama" : "Jadikan Gambar Utama"}
                  >
                    <Star className={cn("size-3.5", img.isPrimary && "fill-current")} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-1.5 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
                    title="Hapus Gambar"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                {img.isPrimary && (
                  <div className="absolute top-1 left-1">
                    <Badge variant="default" className="text-[10px] px-1 py-0 h-4 uppercase font-bold">Primary</Badge>
                  </div>
                )}
              </div>
            ))}
            
            <label className="flex flex-col items-center justify-center aspect-square rounded-md border-2 border-dashed border-input bg-muted/30 hover:bg-muted/50 hover:border-muted-foreground/50 cursor-pointer transition-all gap-1.5">
              <ImagePlus className="size-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-medium">Tambah</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={isSubmitting}
              />
            </label>
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            * Gambar pertama akan otomatis menjadi gambar utama. Klik ikon bintang untuk mengubah.
          </p>
        </div>

        <div className="space-y-3">
          <Label>Profil Rasa (Min. 1, Max. 3) <span className="text-destructive">*</span></Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TASTES.map((taste) => {
              const isSelected = tastes.includes(taste.value);
              return (
                <Button
                  key={taste.value}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTaste(taste.value)}
                  disabled={isSubmitting}
                  className={cn(
                    "rounded-md px-4 py-2 h-auto text-sm transition-all",
                    isSelected ? "shadow-md" : "hover:bg-muted"
                  )}
                >
                  {taste.label}
                  {isSelected && <Plus className="ml-2 h-3.5 w-3.5 rotate-45" />}
                </Button>
              );
            })}
          </div>
          {tastes.length === 0 && (
            <p className="text-[10px] text-destructive font-medium italic">
              * Pilih minimal satu profil rasa
            </p>
          )}
        </div>

        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-black uppercase tracking-widest text-primary">Definisi Varian</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => setVariants([...variants, { package: "250gr", price: 0 }])}
              className="h-8 text-[10px] font-black uppercase tracking-widest border-primary/20 hover:bg-primary/5 rounded-xl"
            >
              <Plus className="mr-1 h-3 w-3" /> Tambah Varian
            </Button>
          </div>

          <div className="space-y-3">
            {variants.length === 0 ? (
              <div className="text-center p-6 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/30">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic leading-relaxed">
                  Opsional: Belum ada varian didefinisikan.<br />Klik tombol di atas untuk menambah varian (e.g. 250gr, bal).
                </p>
              </div>
            ) : (
              variants.map((variant, index) => (
                <div key={index} className="flex items-end gap-3 p-4 rounded-2xl bg-white dark:bg-black/20 border border-gray-100 dark:border-gray-800 shadow-sm animate-in slide-in-from-right-4 duration-300">
                  <div className="flex-1 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Package</Label>
                    <select
                      className="w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-primary/50 text-sm font-bold uppercase transition-all"
                      value={variant.package}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[index].package = e.target.value;
                        setVariants(newVariants);
                      }}
                    >
                      {["Medium", "Small", "250gr", "500gr", "1kg", "bal"].map(pkg => (
                        <option key={pkg} value={pkg}>{pkg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Harga Jual (Rp)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      className="h-10 rounded-xl bg-gray-50 dark:bg-gray-900 border-transparent focus:border-primary/50 font-bold"
                      value={variant.price || ""}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[index].price = Number(e.target.value);
                        setVariants(newVariants);
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Ukuran (gram)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      min={1}
                      className="h-10 rounded-xl bg-gray-50 dark:bg-gray-900 border-transparent focus:border-primary/50 font-bold"
                      value={variant.sizeInGram || ""}
                      onChange={(e) => {
                        const newVariants = [...variants];
                        newVariants[index].sizeInGram = e.target.value ? Number(e.target.value) : undefined;
                        setVariants(newVariants);
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setVariants(variants.filter((_, i) => i !== index))}
                    className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm font-medium border border-destructive/20">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="min-w-[120px] bg-primary text-primary-foreground h-10"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Produk"
          )}
        </Button>
      </div>
    </form>
  );
}
