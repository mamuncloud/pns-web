"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleAlert, CircleCheck, Loader2, Mail } from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated, isEmployee, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      if (isEmployee) {
        router.push("/dashboard");
      } else {
        // Fallback to dashboard if /order doesn't exist or for other user types
        router.push("/dashboard");
      }
    }
  }, [isAuthLoading, isAuthenticated, isEmployee, router]);

  if (isAuthLoading || isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      await api.auth.requestLogin(email);
      setIsSent(true);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to send login link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4 py-12 dark:bg-gray-950">
      <Card className="w-full max-w-md shadow-lg border-gray-200 dark:border-gray-800">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-black text-center tracking-tighter uppercase italic">Otentikasi Akses Staf</CardTitle>
          <CardDescription className="text-center text-[10px] uppercase tracking-[0.2em] font-medium opacity-60">
            Akses via link email & whatsapp
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSent ? (
            <div className="flex flex-col items-center justify-center space-y-4 py-4 text-center">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <CircleCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black uppercase italic tracking-tighter">Periksa Email & WhatsApp</h3>
                <p className="text-sm text-muted-foreground font-medium">
                  Kami telah mengirimkan tautan akses ke <span className="font-black text-primary underline underline-offset-4">{email}</span> dan nomor WhatsApp Anda (jika terdaftar).
                </p>
                <p className="text-[10px] text-muted-foreground/50 font-black uppercase tracking-widest italic pt-2">
                  Tautan berlaku selama 10 menit
                </p>
              </div>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => setIsSent(false)}
              >
                Gunakan email lain
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="name@pns.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-10"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-widest pt-2">
                  Link akan dikirim ke Email & WhatsApp
                </p>
              </div>
              {error && (
                <div className="flex items-center space-x-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive dark:bg-destructive/20">
                  <CircleAlert className="h-4 w-4 shrink-0" />
                  <p>{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full h-10 font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    MENGIRIM TAUTAN...
                  </>
                ) : (
                  "DAPATKAN TAUTAN AKSES"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 text-center text-sm text-muted-foreground">
          <p>
            This area is for authorized managers and cashiers only.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
