"use client";

import { useEffect, useRef } from "react";
import { api } from "@/lib/api";

const REFRESH_BEFORE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const DEBOUNCE_MS = 60 * 1000; // check at most once per minute

function getTokenExpiry(token: string): number | null {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const payload = JSON.parse(atob(payloadBase64));
    if (typeof payload.exp !== "number") return null;
    return payload.exp * 1000; // convert to ms
  } catch {
    return null;
  }
}

export function useActivityRefresh() {
  const lastCheckedAt = useRef<number>(0);
  const isRefreshing = useRef(false);

  useEffect(() => {
    const handleActivity = async () => {
      const now = Date.now();

      // Debounce: don't check more than once per minute
      if (now - lastCheckedAt.current < DEBOUNCE_MS) return;
      lastCheckedAt.current = now;

      // Don't run concurrent refresh calls
      if (isRefreshing.current) return;

      const token = localStorage.getItem("auth_token");
      if (!token) return;

      const expiry = getTokenExpiry(token);
      if (expiry === null) return;

      const timeUntilExpiry = expiry - now;

      // Only refresh if within the refresh window but not yet expired
      if (timeUntilExpiry > 0 && timeUntilExpiry < REFRESH_BEFORE_EXPIRY_MS) {
        isRefreshing.current = true;
        try {
          const { data } = await api.auth.refresh();
          localStorage.setItem("auth_token", data.access_token);
        } catch {
          // Silently fail — if the token is expired, the next API call will
          // handle the 401 and redirect to /staff via fetchApi()
        } finally {
          isRefreshing.current = false;
        }
      }
    };

    const activityEvents: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    activityEvents.forEach((event) =>
      window.addEventListener(event, handleActivity, { passive: true })
    );

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
    };
  }, []);
}
