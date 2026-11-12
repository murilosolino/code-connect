import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'
import { createMemoryRouter, RouterProvider, type RouteObject } from 'react-router'
import { AuthProvider } from '../data/auth/AuthProvider'
import { AppDataProvider } from '../data/store/AppDataProvider'
import type { AppState, AuthViewer } from '../data/types'

/** Pessoa logada por padrão nos testes (a mesma do seed). */
export const JULIO: AuthViewer = { handle: 'julio', name: 'Júlio Oliveira', initials: 'JO', avatarUrl: null }

type Options = {
  /** Endereço inicial. */
  route?: string
  /** Padrão da rota do elemento (ex.: `/projeto/:id`, para `useParams`). */
  path?: string
  /** Árvore de rotas completa (ex.: as `routes` do app); neste caso `ui` é ignorado. */
  routes?: RouteObject[]
  initialState?: AppState
  /** Sessão: `@julio` por padrão; `null` para uma pessoa sem login. Nunca consulta a API. */
  viewer?: AuthViewer | null
}

/**
 * Renderiza dentro do store de dados, da sessão e de um roteador em memória.
 * Devolve também `user` (user-event) e `router` (para checar `router.state.location`).
 */
export function renderWithProviders(
  ui: ReactElement | null = null,
  { route = '/', path = '*', routes, initialState, viewer = JULIO }: Options = {},
) {
  const router = createMemoryRouter(routes ?? [{ path, element: ui }], {
    initialEntries: [route],
  })
  const user = userEvent.setup()
  const utils = render(
    <AppDataProvider initialState={initialState}>
      <AuthProvider initial={{ viewer }}>
        <RouterProvider router={router} />
      </AuthProvider>
    </AppDataProvider>,
  )
  return { user, router, ...utils }
}
