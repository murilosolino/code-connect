import { useId } from 'react'
import { Icon } from './Icon'

type Props = {
  value: string
  onChange: (value: string) => void
  /** Nome acessível do campo (o placeholder do design não serve de rótulo). */
  label: string
}

/** Busca do design system: no foco ou hover, a borda interna de 1px fica verde (sem o anel padrão). */
export function SearchBox({ value, onChange, label }: Props) {
  const id = useId()

  return (
    <div className="flex items-center gap-4 rounded-sm bg-bg-surface px-4 py-2 text-cinza-claro hover:shadow-outline-accent focus-within:shadow-outline-accent">
      <Icon name="search" className="lg:text-icon-lg" />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Digite o que você procura"
        className="w-full bg-transparent text-paragraph-small text-cinza-claro outline-none placeholder:text-cinza-claro lg:text-paragraph-large"
      />
    </div>
  )
}
