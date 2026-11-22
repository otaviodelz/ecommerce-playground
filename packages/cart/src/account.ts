import { getSession } from "@playground/platform/client/session"
import { useQuery } from "@tanstack/react-query"

// Owned by Squad: Login e Sacola.
export const accountQueryKeys = {
  session: () => ["session"] as const,
} as const

// Read by the shared Header across all zones to display the visitor's first name or "entrar".
export const useAccountName = () => useQuery({ queryKey: accountQueryKeys.session(), queryFn: async () => (await getSession()).name })
