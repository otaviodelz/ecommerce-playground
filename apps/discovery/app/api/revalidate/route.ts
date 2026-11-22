import { createRevalidateHandler } from "@playground/platform/revalidate"

// Primary zone webhook: revalidates discovery tags and fans out shared/downstream tags (/categories, prices, /product?id=...) to peer zones.
export const POST = createRevalidateHandler({ zone: "discovery", fanOut: true })
