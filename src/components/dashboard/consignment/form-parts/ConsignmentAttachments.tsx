"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, FileText, Loader2, CircleX } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ConsignmentAttachmentsProps {
  attachmentUrl: string | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  isUploading: boolean;
  note: string;
  onNoteChange: (note: string) => void;
}

export function ConsignmentAttachments({
  attachmentUrl,
  onUpload,
  onRemove,
  isUploading,
  note,
  onNoteChange,
}: ConsignmentAttachmentsProps) {
  return (
    <Card className="rounded-[2.5rem] border-none bg-white/60 dark:bg-slate-900/40 backdrop-blur-3xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden text-foreground">
      <CardContent className="p-8 space-y-8">
        {/* Attachment Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Camera className="h-4 w-4 text-slate-400" />
            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bukti Nota Fisik</h5>
          </div>
          
          {attachmentUrl ? (
            <div className="relative aspect-video rounded-3xl overflow-hidden group border-2 border-primary/20">
              <Image 
                src={attachmentUrl} 
                alt="Nota Attachment" 
                fill
                className="object-cover transition-transform group-hover:scale-105 duration-700" 
                unoptimized
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                <Button variant="ghost" size="icon" onClick={onRemove} className="text-white hover:bg-rose-500/20 hover:text-rose-500">
                  <CircleX className="h-8 w-8" />
                </Button>
              </div>
            </div>
          ) : (
            <label className={cn(
              "flex flex-col items-center justify-center aspect-video rounded-[2rem] border-2 border-dashed transition-all cursor-pointer group",
              isUploading ? "bg-primary/5 border-primary/40 animate-pulse" : "bg-slate-50/50 dark:bg-black/20 border-slate-200 hover:border-primary/40 hover:bg-white"
            )}>
              <input type="file" className="hidden" accept="image/*" onChange={onUpload} disabled={isUploading} />
              {isUploading ? (
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              ) : (
                <>
                  <Camera className="h-8 w-8 text-slate-300 group-hover:text-primary transition-colors mb-3" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-primary transition-colors">Upload Lampiran</span>
                </>
              )}
            </label>
          )}
        </div>

        <div className="h-px bg-slate-200/60 dark:bg-white/5" />

        {/* Notes Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-slate-400" />
            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Catatan Internal</h5>
          </div>
          <textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Tambahkan keterangan tambahan jika diperlukan..."
            className="w-full h-24 rounded-2xl bg-slate-50/50 dark:bg-black/20 border border-slate-200/60 dark:border-white/5 p-4 text-xs font-medium resize-none focus:ring-4 focus:ring-primary/10 transition-all outline-none italic placeholder:text-slate-300"
          />
        </div>
      </CardContent>
    </Card>
  );
}
