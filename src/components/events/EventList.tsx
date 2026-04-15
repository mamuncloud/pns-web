"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { Event } from "@/types/financial";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Loader2, ArrowRight, Calendar, Tag, Copy, Check, ExternalLink } from "lucide-react";
import Link from "next/link";

export function EventList() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyEventLink = useCallback(async (eventId: string) => {
    const baseUrl = window.location.origin;
    const eventUrl = `${baseUrl}/events/${eventId}`;
    
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopiedId(eventId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.events.list();
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/30 dark:bg-gray-900/10">
        <Tag className="h-10 w-10 text-muted-foreground mb-4 opacity-20" />
        <p className="text-muted-foreground font-medium italic">Belum ada event yang dibuat.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-gray-50/50 dark:bg-gray-950/50">
          <TableRow className="border-b-0">
            <TableHead className="w-[300px] text-xs font-black uppercase tracking-wider h-12">Event</TableHead>
            <TableHead className="text-xs font-black uppercase tracking-wider h-12">Tipe</TableHead>
            <TableHead className="text-xs font-black uppercase tracking-wider h-12">Tanggal Dibuat</TableHead>
            <TableHead className="text-xs font-black uppercase tracking-wider h-12">Status</TableHead>
            <TableHead className="text-xs font-black uppercase tracking-wider h-12">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors border-b border-gray-100 dark:border-gray-800/50 last:border-0">
              <TableCell className="py-4">
                <div className="flex flex-col">
                  <span className="font-bold text-base tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {event.name}
                  </span>
                  {event.description && (
                    <span className="text-xs text-muted-foreground truncate max-w-[250px] font-medium italic">
                      {event.description}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-4 font-medium text-sm">
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                  {event.type}
                </div>
              </TableCell>
              <TableCell className="py-4 text-sm text-muted-foreground font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(event.createdAt), "dd MMM yyyy", { locale: id })}
                </div>
              </TableCell>
              <TableCell className="py-4">
                <Badge
                  variant={event.status === "OPEN" ? "default" : "secondary"}
                  className={cn(
                    "rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest",
                    event.status === "OPEN" 
                      ? "bg-green-500/10 text-green-600 border-green-500/20" 
                      : "bg-gray-100 text-gray-400 border-gray-200"
                  )}
                >
                  {event.status}
                </Badge>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full h-8 text-xs font-bold border-primary/20 hover:bg-primary/10 hover:text-primary"
                    onClick={() => copyEventLink(event.id)}
                    disabled={copiedId === event.id}
                  >
                    {copiedId === event.id ? (
                      <>
                        <Check className="mr-1.5 h-3.5 w-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1.5 h-3.5 w-3.5" />
                        Copy Link
                      </>
                    )}
                  </Button>
                  <Link href={`/events/${event.id}`} target="_blank">
                    <Button variant="ghost" size="sm" className="rounded-full h-8 text-xs font-bold hover:bg-primary/10 hover:text-primary">
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                      Lihat
                    </Button>
                  </Link>
                  <Link href={`/dashboard/events/${event.id}`}>
                    <Button variant="ghost" size="sm" className="rounded-full font-bold h-9 hover:bg-primary/10 hover:text-primary group/btn">
                      Kelola Stok
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
