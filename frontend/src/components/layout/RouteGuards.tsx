import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../../data/auth/useAuth'

type FromState = { from?: string } | null

/** Só aceita caminhos internos (um único "/" inicial), para o retorno ao login não virar redirecionamento aberto. */
function safeFrom(state: unknown): string {
  const from = (state as FromState)?.from
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/'
}

/**
 * Telas que exigem login: sem sessão, vai ao login guardando a tela de origem para voltar depois.
 * Enquanto a sessão é consultada não mostra nada, para não piscar o login de quem já está logado.
 */
export function RequireAuth() {
  const { status } = useAuth()
  const { pathname } = useLocation()

  if (status === 'loading') return null
  if (status === 'anonymous') return <Navigate to="/login" replace state={{ from: pathname }} />
  return <Outlet />
}

/** Login e Cadastro: quem já está logado (ou acabou de entrar) segue para a tela de origem ou o feed. */
export function RedirectIfAuthenticated() {
  const { status } = useAuth()
  const { state } = useLocation()

  if (status === 'loading') return null
  if (status === 'authenticated') return <Navigate to={safeFrom(state)} replace />
  return <Outlet />
}
