import { useId } from 'react'
import { Icon } from './Icon'

type Props = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

/**
 * Checkbox nativo (teclado e leitores de tela de graça) estilizado como o design system:
 * caixa de 24px com borda de 2px e raio de 4px. Marcado: borda e ícone `check` em verde-destaque
 * (definição provisória, DESIGN.md Pendência 7). O ícone fica fora do `<label>` para que o
 * texto do rótulo seja só o rótulo.
 */
export function Checkbox({ label, checked, onChange }: Props) {
  const id = useId()

  return (
    <div className="inline-flex items-center gap-2 text-paragraph-small text-offwhite">
      <span className="relative inline-flex size-icon-md shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="m-0 size-full cursor-pointer appearance-none rounded-sm border-2 border-border-inactive bg-transparent checked:border-accent"
        />
        {checked && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-accent">
            <Icon name="check" size="sm" />
          </span>
        )}
      </span>
      <label htmlFor={id} className="cursor-pointer">
        {label}
      </label>
    </div>
  )
}
