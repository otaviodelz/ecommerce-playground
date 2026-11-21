import { twMerge } from "tailwind-merge"

export type ClassValue = string | number | boolean | null | undefined | ClassValue[]

function flatten(inputs: ClassValue[], out: string[]) {
  for (const input of inputs) {
    if (!input && input !== 0) continue
    if (Array.isArray(input)) {
      flatten(input, out)
    } else if (typeof input === "string" || typeof input === "number") {
      out.push(String(input))
    }
  }
}

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = []
  flatten(inputs, out)
  return twMerge(out.join(" "))
}
