"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // Fix for React 19 script tag warning in next-themes 0.4.6
  // This prevents React from attempting to execute the initialization script on the client
  const scriptProps = typeof window === 'undefined' 
    ? undefined 
    : ({ type: 'application/json' } as { type?: string; [key: string]: any });

  return (
    <NextThemesProvider {...props} scriptProps={scriptProps}>
      {children}
    </NextThemesProvider>
  );
}
