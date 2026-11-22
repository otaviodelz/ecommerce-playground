import { act, render, screen } from "@testing-library/react"
import { afterEach, expect, test, vi } from "vitest"
import { useInView } from "./use-in-view"

function Probe() {
  const [ref, inView] = useInView<HTMLDivElement>()
  return <div ref={ref}>{inView ? "visible" : "hidden"}</div>
}

afterEach(() => vi.unstubAllGlobals())

test("turns true when the element intersects, then stops observing", () => {
  let notify: (entries: Partial<IntersectionObserverEntry>[]) => void = () => {}
  const disconnect = vi.fn()
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: typeof notify) {
        notify = callback
      }
      observe() {}
      disconnect = disconnect
    },
  )
  render(<Probe />)
  expect(screen.getByText("hidden")).toBeTruthy()

  act(() => notify([{ isIntersecting: false }]))
  expect(screen.getByText("hidden")).toBeTruthy()

  act(() => notify([{ isIntersecting: true }]))
  expect(screen.getByText("visible")).toBeTruthy()
  expect(disconnect).toHaveBeenCalled()
})

test("without IntersectionObserver it counts as visible", () => {
  vi.stubGlobal("IntersectionObserver", undefined)
  render(<Probe />)
  expect(screen.getByText("visible")).toBeTruthy()
})
