import { Button } from '../ui'

type Props = {
  /** Destino de "GitHub" e "Google" (sem autenticação real nesta etapa). */
  to: string
}

/** Divisor "ou entre com outras contas" e os botões de GitHub e Google. */
export function SocialLoginButtons({ to }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-center gap-4 text-paragraph-small text-text-secondary">
        <span aria-hidden="true" className="h-px flex-1 bg-divider" />
        ou entre com outras contas
        <span aria-hidden="true" className="h-px flex-1 bg-divider" />
      </p>
      <div className="flex gap-4">
        <Button variant="tertiary" to={to} className="flex-1">
          GitHub
        </Button>
        <Button variant="tertiary" to={to} className="flex-1">
          Google
        </Button>
      </div>
    </div>
  )
}
