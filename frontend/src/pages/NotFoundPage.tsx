import { NotFoundState } from '../components/ui'
import { usePageTitle } from '../hooks/usePageTitle'

/** Qualquer endereço desconhecido. */
export function NotFoundPage() {
  usePageTitle('Página não encontrada')

  return (
    <NotFoundState title="Página não encontrada" description="O endereço que você abriu não existe." />
  )
}
