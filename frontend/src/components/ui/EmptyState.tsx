import { Button } from './Button'
import { Icon, type IconName } from './Icon'
import { Surface } from './Surface'

type Props = {
  icon: IconName
  title: string
  description?: string
  /** Ação de saída (ex.: "Voltar ao feed"). */
  action?: { label: string; to: string }
  /** Nível do título: 1 quando o estado ocupa a página inteira, 2 dentro de uma tela. */
  headingLevel?: 1 | 2 | 3
}

/** Estado vazio e "não encontrado" (definição provisória registrada no DESIGN.md). */
export function EmptyState({ icon, title, description, action, headingLevel = 2 }: Props) {
  const Heading = `h${headingLevel}` as const

  return (
    <Surface padding="lg" className="flex flex-col items-center gap-2 text-center">
      <span className="text-text-secondary">
        <Icon name={icon} size="lg" />
      </span>
      <Heading className="text-paragraph-large font-semibold text-text-emphasis">{title}</Heading>
      {description && <p className="text-paragraph-small text-text-secondary">{description}</p>}
      {action && (
        <Button variant="secondary" to={action.to} className="mt-4">
          {action.label}
        </Button>
      )}
    </Surface>
  )
}
