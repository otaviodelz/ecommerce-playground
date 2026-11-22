import type messages from "@playground/platform/messages/pt-BR.json"

declare module "next-intl" {
  interface AppConfig {
    Messages: typeof messages
  }
}
