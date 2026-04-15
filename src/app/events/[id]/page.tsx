import { getProductsFromDb } from "@/lib/products-db";
import EventNavbar from "@/components/events/EventNavbar";
import EventFooter from "@/components/events/EventFooter";
import EventProductCard from "@/components/events/EventProductCard";
import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

interface Event {
  id: string;
  name: string;
  type: string;
  description?: string;
  status: "OPEN" | "CLOSED";
  createdAt: string;
}

async function getEventById(eventId: string): Promise<Event | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: EventPageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return {
      title: "Event Tidak Ditemukan | Planet Nyemil Snack",
    };
  }

  return {
    title: `${event.name} | Planet Nyemil Snack`,
    description:
      event.description ||
      `Pesanan untuk event ${event.name} dari Planet Nyemil Snack.`,
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { id: eventId } = await params;
  const event = await getEventById(eventId);

  const { data: products } = await getProductsFromDb(
    1,
    50,
    undefined,
    undefined,
    true,
    undefined,
    "desc",
    eventId,
  );

  if (!event) {
    return (
      <>
        <EventNavbar eventId="" eventName="" eventType="" />
        <main className="pt-32 pb-32 min-h-[70vh] flex flex-col items-center justify-center px-6">
          <div className="bg-muted w-24 h-24 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-5xl text-muted-foreground">
              inventory_2
            </span>
          </div>
          <h1 className="font-headline font-black text-3xl mb-2 text-dark dark:text-white text-center">
            Event Tidak Ditemukan
          </h1>
          <p className="text-on-background/60 dark:text-zinc-400 text-center mb-8 max-w-md">
            Maaf, event yang Anda cari mungkin sudah ditutup atau link tidak
            valid.
          </p>
        </main>
        <EventFooter />
      </>
    );
  }

  if (event.status === "CLOSED") {
    return (
      <>
        <EventNavbar eventId="" eventName="" eventType="" />
        <main className="pt-32 pb-32 min-h-[70vh] flex flex-col items-center justify-center px-6">
          <div className="bg-rose-100 dark:bg-rose-950/30 w-24 h-24 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-5xl text-rose-500">
              event_busy
            </span>
          </div>
          <h1 className="font-headline font-black text-3xl mb-2 text-dark dark:text-white text-center">
            Event Ditutup
          </h1>
          <p className="text-on-background/60 dark:text-zinc-400 text-center mb-8 max-w-md">
            Maaf, event &ldquo;{event.name}&rdquo; sudah ditutup. Terima kasih
            atas partisipasi Anda!
          </p>
        </main>
        <EventFooter />
      </>
    );
  }

  return (
    <>
      <EventNavbar
        eventId={event.id}
        eventName={event.name}
        eventType={event.type}
      />

      <main className="pt-24 md:pt-28 pb-24 min-h-screen bg-[#fafafa] dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-6">
          {/* Event Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Badge
                variant="outline"
                className="rounded-full px-4 py-1.5 bg-primary/10 text-primary border-primary/20 font-bold text-sm"
              >
                {event.type}
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full px-4 py-1.5 bg-green-500/10 text-green-600 border-green-500/20 font-bold text-sm"
              >
                <span className="h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse" />
                {event.status}
              </Badge>
            </div>
            <h1 className="font-headline font-black text-4xl md:text-5xl text-dark dark:text-white tracking-tight mb-3">
              {event.name}
            </h1>
            {event.description && (
              <p className="text-lg text-on-background/60 dark:text-zinc-400 max-w-2xl">
                {event.description}
              </p>
            )}
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900/50 rounded-[2.5rem] p-16 text-center border border-zinc-200 dark:border-zinc-800">
              <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-10 w-10 text-zinc-400" />
              </div>
              <h2 className="text-2xl font-bold text-dark dark:text-white mb-2">
                Belum Ada Produk
              </h2>
              <p className="text-on-background/60 dark:text-zinc-400 max-w-md mx-auto">
                Produk untuk event ini belum tersedia. Silakan kembali lagi
                nanti.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="font-headline text-2xl font-bold text-dark dark:text-white">
                  Produk Tersedia
                </h2>
                <p className="text-on-background/60 dark:text-zinc-400 text-sm mt-1">
                  {products.length} produk tersedia untuk event ini
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, index) => (
                  <EventProductCard
                    key={product.id}
                    product={product}
                    eventId={eventId}
                    priority={index < 4}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <EventFooter />
    </>
  );
}
