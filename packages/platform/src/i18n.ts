import { getRequestConfig } from "next-intl/server"
import { market } from "./config"

// No i18n routing: each country is its own build, so the locale comes from the market, not the request (pages stay static).
export function createStorefrontRequestConfig() {
  return getRequestConfig(async () => ({
    locale: market.locale,
    messages: (await import(`./messages/${market.locale}.json`)).default,
  }))
}
