"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

// Per-visitor data is fetched in the browser; 30s fresh keeps navigation from refetching what every page shares (basket, favorites).
function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }))
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

export { Providers }
