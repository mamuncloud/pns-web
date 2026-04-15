"use client";

import { useEffect, useState, use, useCallback } from "react";
import { api } from "@/lib/api";
import { Event } from "@/types/financial";
import { Loader2, ArrowLeft, Star, Calendar, Tag, Lock, Unlock, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EventStockManager } from "@/components/events/EventStockManager";
import { EventReportDialog } from "@/components/events/EventReportDialog";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const fetchEvent = useCallback(async () => {
    try {
      const response = await api.events.get(eventId);
      setEvent(response.data);
    } catch (error) {
      console.error("Failed to fetch event", error);
      toast.error("Gagal memuat data event");
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [eventId, fetchEvent]);

  const toggleStatus = async () => {
    if (!event) return;
    const newStatus = event.status === "OPEN" ? "CLOSED" : "OPEN";
    try {
      await api.events.updateStatus(event.id, newStatus);
      toast.success(`Event ${newStatus === "CLOSED" ? "Ditutup" : "Dibuka"}`);
      fetchEvent();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Gagal mengubah status event";
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center">
          <Tag className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight">Event Tidak Ditemukan</h2>
        <Link href="/dashboard/events">
          <Button variant="outline" className="rounded-xl">Kembali ke Daftar Event</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <Link href="/dashboard/events" className="group flex items-center gap-2 text-sm font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors w-fit">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Kembali ke Daftar
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary fill-primary" />
              <Badge variant="outline" className="rounded-full px-3 text-[10px] font-black uppercase bg-primary/5 text-primary border-primary/20 tracking-widest">
                {event.type}
              </Badge>
            </div>
            <h2 className="text-5xl font-black text-foreground tracking-tighter uppercase italic leading-none">
              {event.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {format(new Date(event.createdAt), "dd MMMM yyyy", { locale: id })}
              </div>
              <div className="h-1 w-1 rounded-full bg-gray-300" />
              <div className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] font-black">
                Status: 
                <span className={event.status === "OPEN" ? "text-green-600" : "text-rose-500"}>
                  {event.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="default"
              onClick={() => setIsReportOpen(true)}
              className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[11px] bg-primary text-white hover:bg-primary/90 shadow-lg"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Lihat Laporan
            </Button>
            <Button 
              variant="outline" 
              onClick={toggleStatus}
              className={`rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-[11px] transition-all ${
                event.status === "OPEN" 
                  ? "hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200" 
                  : "hover:bg-green-50 hover:text-green-600 hover:border-green-200"
              }`}
            >
              {event.status === "OPEN" ? (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Tutup Event
                </>
              ) : (
                <>
                  <Unlock className="mr-2 h-4 w-4" />
                  Buka Event
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full">
        <EventStockManager event={event} onRefresh={fetchEvent} />
      </div>

      <EventReportDialog 
        isOpen={isReportOpen} 
        onOpenChange={setIsReportOpen}
        eventId={event.id}
        eventName={event.name}
      />
    </div>
  );
}
