import { useId, type ComponentPropsWithoutRef, type Ref } from 'react'
import { cx } from '../../lib/cx'
import { FieldError } from './FieldError'

type Props = Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'className'> & {
  label: string
  type?: 'text' | 'email' | 'password' | 'textarea'
  /** Mensagem de erro: marca o campo como inválido e a liga a ele para tecnologias assistivas. */
  error?: string
  /** Mantém o rótulo para leitores de tela, sem mostrá-lo. */
  hideLabel?: boolean
  ref?: Ref<HTMLInputElement> | Ref<HTMLTextAreaElement>
}

export function TextField({
  label,
  type = 'text',
  error,
  hideLabel = false,
  ref,
  ...fieldProps
}: Props) {
  const id = useId()
  const errorId = `${id}-error`

  const fieldClasses = cx(
    'w-full rounded-sm bg-field-bg px-4 py-2 text-paragraph-small placeholder:text-on-field',
    // Senha digitada em `grafite` (DESIGN.md, Input); as demais em `on-field`. Exclusivos para não disputar a cor.
    type === 'password' ? 'text-grafite' : 'text-on-field',
    error && 'shadow-field-error',
  )
  const accessibility = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
  }

  return (
    <div className="flex flex-col">
      <label htmlFor={id} className={cx('text-paragraph text-text-primary', hideLabel && 'sr-only')}>
        {label}
      </label>
      <div className={hideLabel ? undefined : 'mt-2'}>
        {type === 'textarea' ? (
          <textarea
            {...(fieldProps as ComponentPropsWithoutRef<'textarea'>)}
            {...accessibility}
            ref={ref as Ref<HTMLTextAreaElement>}
            className={cx(fieldClasses, 'h-textarea')}
          />
        ) : (
          <input
            {...fieldProps}
            {...accessibility}
            type={type}
            ref={ref as Ref<HTMLInputElement>}
            className={fieldClasses}
          />
        )}
        <FieldError id={errorId} message={error} />
      </div>
    </div>
  )
}
