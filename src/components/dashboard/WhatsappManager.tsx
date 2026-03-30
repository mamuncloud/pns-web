"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, RefreshCcw, LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

export default function WhatsappManager() {
  const [status, setStatus] = useState<string>("INITIALIZING");
  const [qr, setQr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await api.whatsapp.status();
      setStatus(response.data.status);
      setQr(response.data.qr || null);
    } catch (error) {
      console.error("Failed to fetch WhatsApp status", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to disconnect WhatsApp? You will need to scan the QR code again to reconnect.")) return;
    
    setIsActionLoading(true);
    try {
      await api.whatsapp.logout();
      await fetchStatus();
    } catch (error) {
      console.error("Failed to logout WhatsApp", error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "CONNECTED":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Connected</Badge>;
      case "QR_READY":
        return <Badge variant="outline" className="text-amber-500 border-amber-500 italic animate-pulse">Waiting for Scan</Badge>;
      case "INITIALIZING":
        return <Badge variant="outline" className="text-blue-500 border-blue-500 animate-pulse">Initializing...</Badge>;
      case "DISCONNECTED":
        return <Badge variant="destructive">Disconnected</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" /> {status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="border-gray-200/50 dark:border-gray-800/50 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl rounded-3xl overflow-hidden">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200/50 dark:border-gray-800/50 shadow-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl rounded-3xl overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-500" />
            WhatsApp Notifier
          </CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>Status koneksi pengiriman magic link.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "QR_READY" && qr && (
          <Dialog>
            <DialogTrigger>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-2xl">
                Scan QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 rounded-3xl">
              <DialogHeader>
                <DialogTitle>Hubungkan WhatsApp</DialogTitle>
                <DialogDescription>
                  Buka WhatsApp di ponsel Anda {'>'} Perangkat Tertaut {'>'} Tautkan Perangkat.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl">
                <div className="p-4 bg-white border-4 border-gray-100 rounded-2xl">
                   {/* Simplified QR representation since we handle qrcode-terminal on backend and this is a component */}
                   {/* In a real app we'd use a QR lib here too or proxy the terminal string */}
                   <div className="text-center space-y-4">
                      <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-300">
                         <RefreshCcw className="w-12 h-12 text-gray-400 animate-spin" />
                      </div>
                      <p className="text-xs text-gray-500 font-medium whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded">
                        QR Code active in server terminal.<br/>
                        Support for UI display coming soon.
                      </p>
                   </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <div className="flex gap-2">
          {status === "CONNECTED" && (
            <Button 
              variant="outline" 
              className="flex-1 h-12 rounded-2xl border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-rose-900/30 dark:hover:bg-rose-900/20 transition-all group"
              onClick={handleLogout}
              disabled={isActionLoading}
            >
              {isActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />}
              Disconnect
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            className="flex-1 h-12 rounded-2xl bg-gray-50 dark:bg-gray-800/50"
            onClick={fetchStatus}
            disabled={isActionLoading}
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${isActionLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
