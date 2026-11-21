import type messages from "./messages/pt-BR.json"

// pt-BR is the reference catalog: t("...") keys and ICU arguments are checked against it.
declare module "next-intl" {
  interface AppConfig {
    Messages: typeof messages
  }
}
