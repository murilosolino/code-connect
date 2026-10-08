import { createBrowserRouter, type RouteObject } from 'react-router'
import { AppLayout } from '../components/layout/AppLayout'
import { NotFoundPage } from '../pages/NotFoundPage'

/**
 * Árvore de rotas (specs/001-frontend-telas-prototipo/contracts/routes.md).
 * Telas internas ficam sob o AppLayout; Login e Cadastro ficam fora dele.
 */
export const routes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [{ path: '*', element: <NotFoundPage /> }],
  },
]

export const createAppRouter = () => createBrowserRouter(routes)
