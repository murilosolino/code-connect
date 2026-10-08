import { EmptyState } from '../components/ui'
import { usePageTitle } from '../hooks/usePageTitle'

/** Qualquer endereço desconhecido. */
export function NotFoundPage() {
  usePageTitle('Página não encontrada')

  return (
    <EmptyState
      icon="info"
      title="Página não encontrada"
      description="O endereço que você abriu não existe."
      action={{ label: 'Voltar ao feed', to: '/' }}
      headingLevel={1}
    />
  )
}
