import Image from "next/image";
import Link from "next/link";
import { getProductsFromDb } from "@/lib/products-db";

export default async function Categories() {
  const { data: products } = await getProductsFromDb(1, 100);
  if (!products || products.length === 0) {
    return null;
  }

  const counts = { Pedas: 0, Gurih: 0, Manis: 0 };
  
  products.forEach((p) => {
    if (p.taste) {
      p.taste.forEach((t) => {
        if (t in counts) {
          counts[t as keyof typeof counts]++;
        }
      });
    }
  });

  return (
    <section className="max-w-7xl mx-auto px-6 mb-24">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="font-headline text-4xl font-extrabold text-primary tracking-tight">
            Kategori Populer
          </h2>
          <p className="text-on-background/60 font-medium mt-2">
            Temukan rasa yang sesuai dengan mood kamu hari ini
          </p>
        </div>
        <Link
          className="text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all"
          href="#"
        >
          Lihat Semua <span className="material-symbols-outlined text-xl">chevron_right</span>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Pedas */}
        <div className="md:col-span-6 group relative overflow-hidden rounded-[2.5rem] bg-[#C62828] h-[400px] flex items-end p-10 cursor-pointer">
          <div className="absolute inset-0 opacity-40 group-hover:scale-105 transition-transform duration-700">
            <Image
              alt="Pedas category"
              className="object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwh7u_IcGu3UPmgaywaxDbRRVelM7WTd_2_S8jcUBGKcdJikwD-DG6llmhKHJrhZOfnhlYJuMizOibDmcGgWXu0h5fqMc-Y_gVBHl1qqaq2cBjmTut-T5OOjhyIULHe6ucB0q_EYl8FkaW-Aue3ybUcyJQSZNd7PzBmjRj7ms5TiVUeJGMoWTe6tynJ5LvFjyUtZRxYZ5573yMhfRH_zT03vlVcMcUAMTF8k67hEFEODYOFnPTu76gJQomCcs5ta5ockKtKk4I1Go"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              loading="eager"
            />
          </div>
          <div className="relative z-10">
            <h3 className="font-headline text-5xl font-black text-white mb-2">Pedas</h3>
            <p className="text-white/90 text-lg">Bikin nagih & meledak di mulut</p>
          </div>
          <div className="absolute bottom-10 right-10 bg-white/20 backdrop-blur-md rounded-full p-4 group-hover:bg-white/40 transition-all">
            <span className="material-symbols-outlined text-white">call_made</span>
          </div>
        </div>

        {/* Gurih */}
        <div className="md:col-span-3 group relative overflow-hidden rounded-[2.5rem] bg-[#E5E0D8] h-[400px] flex items-end p-8 cursor-pointer">
          <div className="absolute inset-0 opacity-40 group-hover:scale-105 transition-transform duration-700">
            <Image
              alt="Gurih category"
              className="object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXxjqJKU_Wih6MwtC_xCZQ8eMt384AzUglFGGRMxHvG3xuxf2MjfpJLJyPB4c0izw8w8Cw-HubwVCvZ6JxCN4BBcAqrknbTGE51Lh4uQ_az2jo55I9K-LibMiKCNtFp6UPuwCECdbTcyBk3i0lHG90W_Uxu-ngQHrYxZaeC_QpmofQaXq-H1gUs_AgWX1N4m42XkUlIXkcxwTzfoa1F08U7ybS46O6lYjPLhynwo3_PhVYD1_LwBmrAiuSARGKZxRjIiu4AwdT3gM"
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </div>
          <div className="relative z-10">
            <h3 className="font-headline text-3xl font-extrabold text-dark mb-1">Gurih</h3>
            <p className="text-dark/60 font-bold">{counts.Gurih} Produk</p>
          </div>
        </div>

        {/* Manis */}
        <div className="md:col-span-3 group relative overflow-hidden rounded-[2.5rem] bg-[#F8F6F4] h-[400px] flex items-end p-8 cursor-pointer">
          <div className="absolute inset-0 opacity-40 group-hover:scale-105 transition-transform duration-700">
            <Image
              alt="Manis category"
              className="object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7l4XM6prYMremY1Rbk1zAMlV1iebaIr0rZrqazt1uJnAUIXJgWWeCIpy6T7vCsHpBeZdhVD_OB3Ds1ryTn7YZjgV3CChJMLkW6zIvNNuTV7KmzC5hXEVZtng0WxT1g-InIGc0nlzLP3JhuOUfqM9BQlycEv6IjFuCyPaCLqyDCMAc1bN9J-XECUZfZDsgj4GaML0cDIwhfpoJII5DAKj9L54OfeXlbFs9oznCOgh2WNqxS5ioPsfVNB7Kjm-gsE_z4c6AkbtjEsw"
              fill
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          </div>
          <div className="relative z-10">
            <h3 className="font-headline text-3xl font-extrabold text-dark mb-1">Manis</h3>
            <p className="text-dark/60 font-bold">{counts.Manis} Produk</p>
          </div>
        </div>
      </div>
    </section>
  );
}
