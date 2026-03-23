import Image from "next/image";

export default function Bestsellers() {
  return (
    <section className="max-w-7xl mx-auto px-6 mb-24">
      <h2 className="font-headline text-4xl font-extrabold text-primary mb-12 text-center">
        Produk Terlaris Minggu Ini
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Product 1 */}
        <div className="flex flex-col group">
          <div className="aspect-square bg-[#F5F5F5] rounded-[2.5rem] overflow-hidden relative mb-6">
            <div className="absolute top-5 left-5 z-20 bg-primary text-white font-bold text-[10px] px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <span
                className="material-symbols-outlined text-[12px]"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                star
              </span>
              Terlaris
            </div>
            <Image
              alt="Basreng Pedas"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJsdhRZKYL6zo9Mdx9cVWQNU0HwZ9QwfXqgM_27Ox0k3OW_uxNGhStPMZFVkHJL6_6nr9Ya29juAaUCVAf8DDS0O9fk6V3VYQupkrdozVqEDpY6B6eGeENijGmV_9_wAUobFiP1AhRo0GaoTFwN49ojRNxaT7zh27-Fzv20M-zb3UcANMpR4GB_C0vykgSr-C70QQmjpyE-WUU4o9eYFpXe73LiH8eZBi6e9wkbdGvUK2XFbXFMKI8bV5niZcKTM2BbNs4q9lzCmk"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              priority
            />
          </div>
          <h3 className="font-headline text-2xl font-bold text-dark mb-1">
            Basreng Pedas Daun Jeruk
          </h3>
          <span className="font-bold text-primary text-xl mb-3">Rp 15.000</span>
          <p className="text-on-background/60 text-sm mb-5 leading-relaxed">
            Potongan bakso goreng renyah dengan aroma jeruk segar.
          </p>
          <div className="flex gap-2">
            <span className="px-4 py-1.5 bg-[#FDF2F2] rounded-full text-[10px] font-bold text-primary">
              250gr
            </span>
            <span className="px-4 py-1.5 bg-[#FDF2F2] rounded-full text-[10px] font-bold text-primary">
              Pedas Level 5
            </span>
          </div>
        </div>

        {/* Product 2 */}
        <div className="flex flex-col group">
          <div className="aspect-square bg-[#F5F5F5] rounded-[2.5rem] overflow-hidden relative mb-6">
            <div className="absolute top-5 left-5 z-20 bg-primary text-white font-bold text-[10px] px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <span
                className="material-symbols-outlined text-[12px]"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                star
              </span>
              Terlaris
            </div>
            <Image
              alt="Keripik Singkong"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYlTJfJxTnu08u5oYEkJ5si5z_NvEZxm2ejbqR1ly1iI2-X5j8MTd77Kbgkw2HQluDZ6FHJ6eUgQMv_nSnBpgMQn46Dbr7D2lRLmsI1Rfy6uC3C28N5I7afW-fhIOAylHKFWJ69AE1AAAZIHk94w6Hr99QaiPPS0IJrG492gZQyVjXJXSqBEQ1ivFjYYksIvndXeDh5A3O5Xs1yQeatU9vrqgqujl18dPQ3iRnfvZaKkd5_ycKZ5oXyBJTRJ-Cn5Exkz9ru4wSAPg"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
          <h3 className="font-headline text-2xl font-bold text-dark mb-1">
            Keripik Singkong Balado
          </h3>
          <span className="font-bold text-primary text-xl mb-3">Rp 20.000</span>
          <p className="text-on-background/60 text-sm mb-5 leading-relaxed">
            Irisan tipis singkong pilihan dengan bumbu balado rahasia.
          </p>
          <div className="flex gap-2">
            <span className="px-4 py-1.5 bg-[#FDF2F2] rounded-full text-[10px] font-bold text-primary">
              500gr
            </span>
            <span className="px-4 py-1.5 bg-[#FDF2F2] rounded-full text-[10px] font-bold text-primary">
              Manis Pedas
            </span>
          </div>
        </div>

        {/* Product 3 */}
        <div className="flex flex-col group">
          <div className="aspect-square bg-[#F5F5F5] rounded-[2.5rem] overflow-hidden relative mb-6">
            <div className="absolute top-5 left-5 z-20 bg-primary text-white font-bold text-[10px] px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <span
                className="material-symbols-outlined text-[12px]"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                star
              </span>
              Terlaris
            </div>
            <Image
              alt="Makaroni Spiral"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuTLDzRqM4SeLC0vGrkDDAUEOfhKCDO6IGUYQRklPCyyL-bn8Q1K-4kXUzt-YFvRyE4uDFqRE52zcEvigeATKX_zMDOyprw9S5OvXAMe8l-crauNULUAHXZP2qZ7igAy2T8FGdsKqelZRDDd1VHD1Te4psvE5F_iHZHi5DC1mA9Aoz_6C6h9OwEKtn3nSBwUCQ4b4BYkiyceBakqfVVW7eVqTIP9YzVvORNqBGKlA0fXMXXnC8uD_PdWRFBIZHYTQhsQMZ2Tu9cpg"
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
          <h3 className="font-headline text-2xl font-bold text-dark mb-1">
            Makaroni Spiral Pedas
          </h3>
          <span className="font-bold text-primary text-xl mb-3">Rp 90.000</span>
          <p className="text-on-background/60 text-sm mb-5 leading-relaxed">
            Tekstur renyah makaroni spiral dengan taburan cabai asli.
          </p>
          <div className="flex gap-2">
            <span className="px-4 py-1.5 bg-[#FDF2F2] rounded-full text-[10px] font-bold text-primary">
              Grocery
            </span>
            <span className="px-4 py-1.5 bg-[#FDF2F2] rounded-full text-[10px] font-bold text-primary">
              Extra Hot
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
