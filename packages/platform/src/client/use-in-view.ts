import { useEffect, useRef, useState } from "react"

// True once the element has been within `margin` of the viewport (it stays true: data already fetched isn't dropped
// when it scrolls away). Clipped by scroll containers too, so a carousel's off-screen slides count as hidden; scrollMargin
// extends the margin into them where the browser supports it. No IntersectionObserver: true right away.
export function useInView<T extends Element>(margin = "0px") {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element || inView) return
    if (typeof IntersectionObserver === "undefined") return setInView(true)
    // shortcut: scrollMargin is missing from TypeScript's DOM types; drop the intersection type once lib.dom ships it.
    const options: IntersectionObserverInit & { scrollMargin?: string } = { rootMargin: margin, scrollMargin: margin }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setInView(true)
        observer.disconnect()
      },
      options,
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [inView, margin])

  return [ref, inView] as const
}
