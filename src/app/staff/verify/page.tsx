"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2, Smartphone } from "lucide-react";
import { isMobileDevice } from "@/lib/utils";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(token ? "loading" : "error");
  const [error, setError] = useState<string | null>(token ? null : "No token provided.");
  const [isWaitingForApp, setIsWaitingForApp] = useState(false);
  const verifyAttempted = useRef(false);

  useEffect(() => {
    if (!token) return;

    if (verifyAttempted.current) return;
    verifyAttempted.current = true;

    const verifyToken = async () => {
      try {
        const response = await api.auth.verifyLogin(token);
        localStorage.setItem("auth_token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        setStatus("success");
        
        // Redirect after a short delay
        setTimeout(() => {
          const { type } = response.data.user;
          
          if (type === "EMPLOYEE") {
            router.push("/dashboard")
          } else {
            // Consumer redirect to products catalog
            router.push("/products");
          }
        }, 1500);
      } catch (err) {
        const error = err as Error;
        setStatus("error");
        setError(error.message || "Failed to verify link. It may be expired or invalid.");
      }
    };

    // Check if it's likely a mobile device for deep-link handling
    const isMobile = isMobileDevice();

    if (isMobile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsWaitingForApp(true);
      // Small delay on mobile to allow app-link switch/processing first
      const timeout = setTimeout(() => {
        setIsWaitingForApp(false);
        verifyToken();
      }, 1500);
      return () => clearTimeout(timeout);
    } else {
      verifyToken();
    }
  }, [token, router]);

  return (
    <Card className="w-full max-w-md shadow-lg border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-center">
          {status === "loading" && "Verifying your link..."}
          {status === "success" && "Login successful!"}
          {status === "error" && "Verification failed"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
        {isWaitingForApp && (
          <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="relative">
              <Smartphone className="h-12 w-12 text-primary animate-pulse" />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-ping" />
            </div>
            <p className="text-center text-sm font-medium text-muted-foreground max-w-[200px]">
              Checking for the PNS mobile application...
            </p>
          </div>
        )}
        {!isWaitingForApp && status === "loading" && (
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            <p className="text-center text-muted-foreground">
              Authenticating... You will be redirected shortly.
            </p>
          </>
        )}
        {status === "error" && (
          <>
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-center text-destructive font-medium">{error}</p>
            <button 
              onClick={() => router.push("/staff")}
              className="text-sm text-primary hover:underline font-medium"
            >
              Back to login
            </button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4 dark:bg-gray-950">
      <Suspense fallback={
        <Card className="w-full max-w-md shadow-lg border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-center">
              Verifying your link...
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </CardContent>
        </Card>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
