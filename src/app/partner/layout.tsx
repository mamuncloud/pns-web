import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Program Kemitraan | Planet Nyemil Snack',
  description: 'Bergabunglah menjadi mitra Planet Nyemil Snack. Tersedia program Reseller, Dropshipper, dan Grosir dengan margin menarik.',
  alternates: {
    canonical: '/partner',
  },
};

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
