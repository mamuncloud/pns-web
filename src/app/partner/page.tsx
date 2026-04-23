import { Metadata } from "next";
import PartnerPageContent from "@/components/partner/PartnerPageContent";

export const metadata: Metadata = {
  title: "Kemitraan & Reseller | Planet Nyemil Snack",
  description:
    "Jadilah mitra Planet Nyemil Snack. Kami membuka peluang bagi reseller dan agen grosir camilan dengan harga terbaik dan dukungan pemasaran penuh.",
  alternates: {
    canonical: "/partner",
  },
  openGraph: {
    title: "Kemitraan & Reseller | Planet Nyemil Snack",
    description:
      "Mulai bisnis snack Anda bersama kami. Peluang reseller dan grosir snack terlengkap di Karawaci.",
    images: ["/logo.png"],
  },
};

export default function PartnerPage() {
  return <PartnerPageContent />;
}
