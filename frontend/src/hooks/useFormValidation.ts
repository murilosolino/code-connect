import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { validate, type FormErrors, type Schema } from '../lib/validation'

type FieldElement = HTMLInputElement | HTMLTextAreaElement

/**
 * Estado, validação e foco de um formulário:
 * valida no envio (não a cada tecla), foca o primeiro campo inválido e limpa o erro
 * de um campo assim que ele é corrigido. Os valores chegam a `onValid` como digitados;
 * campos só com espaços contam como vazios porque as regras (`required`) fazem `trim`.
 * `onValid` pode ser assíncrono: `submitting` fica ligado até terminar, e um segundo envio
 * durante a espera é ignorado. Erros devolvidos pelo servidor entram por `setFieldErrors`.
 */
export function useFormValidation<K extends string>(schema: Schema<K>) {
  const fieldNames = Object.keys(schema) as K[]
  const [values, setValues] = useState(
    () => Object.fromEntries(fieldNames.map((name) => [name, ''])) as Record<K, string>,
  )
  const [errors, setErrors] = useState<FormErrors<K>>({})
  const [submitting, setSubmitting] = useState(false)
  const inFlight = useRef(false)
  const elements = useRef<Partial<Record<K, FieldElement | null>>>({})

  const setValue = (name: K, value: string) => {
    setValues((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!(name in current)) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  /** Mostra erros por campo (ex.: vindos da API) e foca o primeiro campo conhecido com erro. */
  const setFieldErrors = (found: FormErrors<K>) => {
    setErrors(found)
    const firstInvalid = fieldNames.find((name) => found[name])
    if (firstInvalid) elements.current[firstInvalid]?.focus()
  }

  /** Props para espalhar em um `TextField` (ou `<input>`/`<textarea>`, tirando `error`). */
  const register = (name: K) => ({
    name,
    value: values[name],
    error: errors[name],
    onChange: (event: ChangeEvent<FieldElement>) => setValue(name, event.target.value),
    ref: (element: FieldElement | null) => {
      elements.current[name] = element
    },
  })

  const handleSubmit =
    (onValid: (values: Record<K, string>) => void | Promise<void>) => async (event: FormEvent) => {
      event.preventDefault()
      if (inFlight.current) return

      const found = validate(schema, values)
      setFieldErrors(found)
      if (fieldNames.some((name) => found[name])) return

      inFlight.current = true
      setSubmitting(true)
      try {
        await onValid(values)
      } finally {
        inFlight.current = false
        setSubmitting(false)
      }
    }

  return { values, errors, submitting, setValue, setFieldErrors, register, handleSubmit }
}
