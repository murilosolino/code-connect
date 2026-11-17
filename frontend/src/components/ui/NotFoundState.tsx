import { EmptyState } from './EmptyState'

type Props = {
  title: string
  description: string
}

/** "Não encontrado" de uma tela inteira (página, projeto ou perfil): título `h1` e caminho de volta ao feed. */
export function NotFoundState({ title, description }: Props) {
  return (
    <EmptyState
      icon="info"
      title={title}
      description={description}
      action={{ label: 'Voltar ao feed', to: '/' }}
      headingLevel={1}
    />
  )
}
