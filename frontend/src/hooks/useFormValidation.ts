import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { validate, type FormErrors, type Schema } from '../lib/validation'

type FieldElement = HTMLInputElement | HTMLTextAreaElement

/**
 * Estado, validação e foco de um formulário:
 * valida no envio (não a cada tecla), foca o primeiro campo inválido e limpa o erro
 * de um campo assim que ele é corrigido. Os valores chegam a `onValid` como digitados;
 * campos só com espaços contam como vazios porque as regras (`required`) fazem `trim`.
 */
export function useFormValidation<K extends string>(schema: Schema<K>) {
  const fieldNames = Object.keys(schema) as K[]
  const [values, setValues] = useState(
    () => Object.fromEntries(fieldNames.map((name) => [name, ''])) as Record<K, string>,
  )
  const [errors, setErrors] = useState<FormErrors<K>>({})
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

  const handleSubmit = (onValid: (values: Record<K, string>) => void) => (event: FormEvent) => {
    event.preventDefault()
    const found = validate(schema, values)
    setErrors(found)
    const firstInvalid = fieldNames.find((name) => found[name])
    if (firstInvalid) {
      elements.current[firstInvalid]?.focus()
      return
    }
    onValid(values)
  }

  return { values, errors, setValue, register, handleSubmit }
}
