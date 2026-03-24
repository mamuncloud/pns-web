"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const verifyAttempted = useRef(false);

  useEffect(() => {
    if (!token) {
      Promise.resolve().then(() => {
        setStatus("error");
        setError("No token provided.");
      });
      return;
    }

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
          const { type, role } = response.data.user;
          
          if (type === "EMPLOYEE") {
            if (role === "MANAGER") {
              router.push("/dashboard/manager");
            } else {
              router.push("/dashboard/cashier");
            }
          } else {
            // Consumer redirect
            router.push("/profile");
          }
        }, 1500);
      } catch (err) {
        const error = err as Error;
        setStatus("error");
        setError(error.message || "Failed to verify link. It may be expired or invalid.");
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50/50 px-4 dark:bg-gray-950">
      <Card className="w-full max-w-md shadow-lg border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">
            {status === "loading" && "Verifying your link..."}
            {status === "success" && "Login successful!"}
            {status === "error" && "Verification failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
          {status === "loading" && (
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
                onClick={() => router.push("/login")}
                className="text-sm text-primary hover:underline font-medium"
              >
                Back to login
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
