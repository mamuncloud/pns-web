"use client";

import { useState, useCallback } from "react";
import Cropper, { Point, Area } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getCroppedImg, compressImage } from "@/lib/image";
import { Loader2 } from "lucide-react";

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
  open: boolean;
}

/**
 * A specialized dialog for cropping images to a 1:1 aspect ratio.
 * Provides a premium, fluid interaction with zoom controls.
 */
export function ImageCropper({
  image,
  onCropComplete,
  onCancel,
  open,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = (crop: Point) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(image, croppedAreaPixels);
      if (croppedBlob) {
        // Compress the cropped image to ensure it's under limits
        const compressedBlob = await compressImage(croppedBlob, 1600, 0.8);
        onCropComplete(compressedBlob);
      }
    } catch (e) {
      console.error("[ImageCropper] Failed to process crop:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-2xl overflow-hidden flex flex-col h-[80vh] sm:h-[700px] p-0 gap-0 border-none sm:rounded-[2.5rem] shadow-2xl bg-white dark:bg-zinc-950">
        <DialogHeader className="px-8 py-6 border-b border-gray-100 dark:border-zinc-800 shrink-0">
          <DialogTitle className="text-xl font-black uppercase tracking-tight text-primary">
            Adjust Product Frame
          </DialogTitle>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
            Ensure the product is centered for clear visibility
          </p>
        </DialogHeader>

        <div className="relative flex-1 bg-zinc-900 overflow-hidden">
          {image && (
            <Cropper
              image={image}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={onCropChange}
              onCropComplete={onCropCompleteCallback}
              onZoomChange={onZoomChange}
              classes={{
                containerClassName: "bg-zinc-900 shadow-inner",
                mediaClassName: "max-w-none transition-none",
                cropAreaClassName: "border-2 border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] rounded-2xl",
              }}
            />
          )}
        </div>

        <div className="p-8 space-y-8 bg-white dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-800 shrink-0">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Zoom Level</span>
              <span className="text-sm font-black tabular-nums text-primary">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="relative group flex items-center">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => onZoomChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-primary transition-all group-hover:h-2.5 outline-none"
              />
            </div>
          </div>

          <DialogFooter className="flex sm:flex-row flex-col gap-3 sm:justify-end">
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isProcessing}
              className="rounded-2xl font-black uppercase text-[10px] tracking-widest h-12 px-6 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all border border-gray-100 dark:border-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isProcessing}
              className="rounded-2xl bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-[0.2em] px-10 h-12 shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] transition-all active:scale-[0.98]"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                "Finish Crop"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
