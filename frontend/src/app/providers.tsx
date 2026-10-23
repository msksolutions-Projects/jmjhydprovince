import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { queryClient } from "./queryClient";
import { AppErrorBoundary } from "@/components/common/AppErrorBoundary";

/** Single composition point for every app-wide provider. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AppErrorBoundary>{children}</AppErrorBoundary>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
