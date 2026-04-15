"use client"

import { useSyncExternalStore } from "react"

function subscribe() {
  return () => {}
}

function getSnapshot() {
  return true
}

function getServerSnapshot() {
  return false
}

export function ClientOnly({
  children,
  fallback = null,
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const isMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (!isMounted) return <>{fallback}</>
  return <>{children}</>
}
