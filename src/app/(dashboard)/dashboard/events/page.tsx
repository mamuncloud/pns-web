"use client";

import { useState } from "react";
import { EventList } from "@/components/events/EventList";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { Star } from "lucide-react";

export default function EventsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Star className="h-5 w-5 text-primary fill-primary animate-pulse" />
            <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">PNS Feature</span>
          </div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase italic bg-gradient-to-br from-foreground to-foreground/50 bg-clip-text text-transparent">
            Event Management
          </h2>
          <p className="text-sm text-muted-foreground font-medium max-w-2xl">
            Kelola stok untuk event khusus seperti pameran, bazar, atau donasi. 
            Stok yang dialokasikan ke event akan dipisahkan dari gudang utama dan hanya bisa terjual via Mayar QRIS.
          </p>
        </div>
        <CreateEventDialog onSuccess={() => setRefreshKey(prev => prev + 1)} />
      </div>

      <div className="w-full">
        <EventList key={refreshKey} />
      </div>
    </div>
  );
}
