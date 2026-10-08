import { Icon } from './Icon'

type Props = {
  id: string
  message?: string
}

/**
 * Mensagem de erro de campo (FR-026). A região `aria-live` fica sempre no DOM, para que
 * o leitor de tela anuncie a mensagem quando ela aparecer.
 */
export function FieldError({ id, message }: Props) {
  return (
    <div id={id} aria-live="polite">
      {message && (
        <p className="mt-2 flex items-center gap-2 text-paragraph-small text-offwhite">
          <Icon name="error" size="sm" />
          {message}
        </p>
      )}
    </div>
  )
}
