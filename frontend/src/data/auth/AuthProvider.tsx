import { useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ApiError, apiRequest } from '../../lib/api'
import { AppDataContext } from '../store/AppDataContext'
import type { AuthViewer } from '../types'
import { AuthContext, type AuthContextValue, type AuthStatus } from './AuthContext'

type Props = {
  children: ReactNode
  /** Sessão já conhecida; os testes usam para não consultar a API. */
  initial?: { viewer: AuthViewer | null }
}

/**
 * Sessão da pessoa: consulta `/auth/me` ao abrir (o cookie é `httpOnly`, então só a API sabe
 * se há sessão) e leva a pessoa para o store, que ainda guarda os demais dados em memória.
 */
export function AuthProvider({ children, initial }: Props) {
  const app = useContext(AppDataContext)
  if (!app) throw new Error('<AuthProvider> precisa estar dentro de <AppDataProvider>.')
  const { dispatch } = app

  const [viewer, setViewer] = useState<AuthViewer | null>(initial?.viewer ?? null)
  const [status, setStatus] = useState<AuthStatus>(
    initial ? (initial.viewer ? 'authenticated' : 'anonymous') : 'loading',
  )

  const apply = (next: AuthViewer | null) => {
    setViewer(next)
    setStatus(next ? 'authenticated' : 'anonymous')
  }

  useEffect(() => {
    if (initial) return
    let cancelled = false
    apiRequest<AuthViewer>('/auth/me')
      .then((found) => !cancelled && apply(found))
      .catch(() => !cancelled && apply(null))
    return () => {
      cancelled = true
    }
    // Só na montagem: a sessão muda por login, cadastro e logout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    dispatch(viewer ? { type: 'setViewer', viewer } : { type: 'clearViewer' })
  }, [status, viewer, dispatch])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      viewer,
      login: async (input) => {
        apply(await apiRequest<AuthViewer>('/auth/login', { method: 'POST', body: input }))
      },
      signup: async (input) => {
        apply(await apiRequest<AuthViewer>('/auth/signup', { method: 'POST', body: input }))
      },
      logout: async () => {
        try {
          await apiRequest('/auth/logout', { method: 'POST' })
        } catch (error) {
          // 401: a sessão já tinha expirado, então sair é só limpar o estado local.
          if (!(error instanceof ApiError && error.status === 401)) throw error
        }
        apply(null)
      },
    }),
    // `apply` só usa setters estáveis.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status, viewer],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
