"use client"

import { useState, useTransition, type FormEvent } from "react"

export type FormAction = (form: FormData) => Promise<{ error?: string }>

// onSubmit instead of <form action>: React resets the form after an action, wiping the typed values and the error.
export function useFormAction(action: FormAction, onSuccess?: () => void) {
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    startTransition(async () => {
      const result = await action(form)
      setError(result.error ?? "")
      if (!result.error) onSuccess?.()
    })
  }
  return { error, clear: () => setError(""), onSubmit, pending }
}
