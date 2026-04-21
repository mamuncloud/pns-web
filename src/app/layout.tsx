import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.planetnyemilsnack.store"),
  title: "Planet Nyemil Snack | Toko Snack Karawaci Terlengkap & Termurah",
  description: "Cari toko snack Karawaci? Planet Nyemil Snack menyediakan berbagai camilan pedas, gurih, dan manis terlengkap di Tangerang. Lokasi strategis di Karawaci Baru.",
  keywords: ["toko snack karawaci", "camilan karawaci", "snack pedas tangerang", "planet nyemil snack", "pusat camilan karawaci"],
  openGraph: {
    title: "Planet Nyemil Snack | Toko Snack Karawaci",
    description: "Pusat camilan favorit Karawaci. Grosir dan eceran snack kekinian.",
    url: "https://www.planetnyemilsnack.store/",
    siteName: "Planet Nyemil Snack",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  icons: {
    icon: "/favicon.png",
  },
};

import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/contexts/CartContext";
import FloatingCart from "@/components/FloatingCart";
import { ClientOnly } from "@/components/ClientOnly";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${montserrat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col font-body selection:bg-accent/30 selection:text-dark overflow-x-hidden">
        {/* Local Business Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Planet Nyemil Snack",
              "image": "https://www.planetnyemilsnack.store/logo.png",
              "@id": "https://www.planetnyemilsnack.store",
              "url": "https://www.planetnyemilsnack.store",
              "telephone": "+6285800342727",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Jl. Beringin Raya No.6B, RT.006/RW.002, Karawaci Baru, Kec. Karawaci",
                "addressLocality": "Tangerang",
                "postalCode": "15116",
                "addressCountry": "ID"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": -6.1947517,
                "longitude": 106.6111053
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday"
                ],
                "opens": "10:00",
                "closes": "22:00"
              },
              "sameAs": [
                "https://www.instagram.com/planetnyemilsnack"
              ]
            })
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <CartProvider>
            {children}
            <ClientOnly>
              <FloatingCart />
              <Toaster />
            </ClientOnly>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
