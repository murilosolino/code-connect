import { useRef, type KeyboardEvent } from 'react'
import { cx } from '../../lib/cx'

type Item = { id: string; label: string }

type Props = {
  items: Item[]
  /** Id da aba selecionada. */
  value: string
  onChange: (id: string) => void
  /** Nome do grupo de abas para leitores de tela. */
  label: string
  /** Id do painel controlado; o painel deve usar `aria-labelledby={tabId(panelId, value)}`. */
  panelId: string
}

export const tabId = (panelId: string, id: string): string => `${panelId}-tab-${id}`

/** Abas no padrão WAI-ARIA: setas ←/→ movem o foco e ativam a aba (com volta circular). */
export function Tabs({ items, value, onChange, label, panelId }: Props) {
  const elements = useRef<Record<string, HTMLButtonElement | null>>({})

  const activate = (index: number) => {
    const next = items[(index + items.length) % items.length]
    onChange(next.id)
    elements.current[next.id]?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    const target: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: items.length - 1,
    }
    if (event.key in target) {
      event.preventDefault()
      activate(target[event.key])
    }
  }

  return (
    <div role="tablist" aria-label={label} className="flex gap-6">
      {items.map((item, index) => {
        const selected = item.id === value
        return (
          <button
            key={item.id}
            ref={(element) => {
              elements.current[item.id] = element
            }}
            id={tabId(panelId, item.id)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cx(
              'cursor-pointer px-1 text-paragraph-large max-sm:text-paragraph',
              selected
                ? 'font-semibold text-accent underline'
                : 'font-normal text-text-secondary hover:text-cinza-claro',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
