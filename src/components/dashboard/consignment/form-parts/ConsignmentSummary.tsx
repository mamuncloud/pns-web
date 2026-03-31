"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Scale, Loader2, CircleCheck } from "lucide-react";

interface ConsignmentSummaryProps {
  totalValue: number;
  totalQty: number;
  itemCount: number;
  onSubmit: () => void;
  isSubmitting: boolean;
  isValid: boolean;
}

export function ConsignmentSummary({
  totalValue,
  totalQty,
  itemCount,
  onSubmit,
  isSubmitting,
  isValid,
}: ConsignmentSummaryProps) {
  return (
    <Card className="rounded-[2.5rem] border-none bg-gradient-to-br from-primary via-primary/90 to-primary/80 dark:from-primary/20 dark:via-primary/10 dark:to-transparent text-white dark:text-foreground shadow-2xl shadow-primary/20 relative overflow-hidden group">
      <div className="absolute -top-12 -right-12 opacity-10 rotate-[-15deg] group-hover:rotate-0 transition-transform duration-1000">
         <Calculator className="h-56 w-56 blur-sm" />
      </div>
      
      <CardContent className="p-10 relative space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Nota Summary</h4>
            <p className="text-xl font-bold tracking-tight text-white">Kalkulasi Stok</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
             <Scale className="h-6 w-6 text-white" />
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-2">
            <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em] text-center md:text-left text-white">Total Valuasi Nota</p>
            <div className="flex items-baseline justify-center md:justify-start gap-3">
              <span className="text-xl font-bold opacity-70 text-white">Rp</span>
              <span className="text-5xl font-black tracking-tighter tabular-nums drop-shadow-md text-white">
                {totalValue.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-white">
             <div className="p-5 rounded-[1.5rem] bg-white/10 backdrop-blur-md border border-white/10">
                <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1">Units</p>
                <p className="text-2xl font-black tabular-nums">{totalQty}</p>
             </div>
             <div className="p-5 rounded-[1.5rem] bg-white/10 backdrop-blur-md border border-white/10">
                <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1">Variant</p>
                <p className="text-2xl font-black tabular-nums">{itemCount}</p>
             </div>
          </div>

          <div className="pt-4">
            <Button 
              onClick={onSubmit}
              disabled={isSubmitting || !isValid}
              className="w-full h-16 rounded-[1.8rem] bg-white text-primary hover:bg-slate-100 dark:bg-primary dark:text-white dark:hover:bg-primary/80 dark:border dark:border-white/10 transition-all shadow-xl font-black uppercase tracking-widest text-xs group disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <span className="flex items-center gap-3">
                  SAHKAN REGISTRI
                  <CircleCheck className="h-5 w-5 opacity-70 group-hover:scale-110 transition-transform text-emerald-500" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
