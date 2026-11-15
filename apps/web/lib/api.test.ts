import { expect, test } from "vitest"
import { discountPercent, installments } from "./api"

test("installments split up to 10x with a R$ 10 minimum", () => {
  expect(installments(29990)).toEqual({ count: 10, value: 2999 })
  expect(installments(5990)).toEqual({ count: 5, value: 1198 })
  expect(installments(1999)).toBeNull()
  expect(installments(2000)).toEqual({ count: 2, value: 1000 })
})

test("discount is a rounded percentage, zero without a higher list price", () => {
  expect(discountPercent(29990, 39990)).toBe(25)
  expect(discountPercent(89990, 99990)).toBe(10)
  expect(discountPercent(18990, 18990)).toBe(0)
})
