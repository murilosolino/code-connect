import { Outlet } from 'react-router'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { MobileNav } from './MobileNav'
import { NAV_ITEMS } from './navigation'
import { Sidebar } from './Sidebar'

/** Menu lateral a partir de 1024px (`lg`); abaixo disso, barra horizontal (DESIGN.md §5). */
const DESKTOP_QUERY = '(min-width: 1024px)'

/**
 * Layout das telas internas: menu (lateral ou em barra) e o conteúdo da rota.
 * Só uma navegação principal existe por vez no DOM.
 */
export function AppLayout() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  return (
    <div className="min-h-screen bg-bg-page px-page py-6 lg:py-10">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-10 focus:rounded-md focus:bg-accent focus:px-4 focus:py-3 focus:text-paragraph focus:font-semibold focus:text-on-accent"
      >
        Pular para o conteúdo
      </a>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row lg:gap-10">
        {isDesktop ? <Sidebar items={NAV_ITEMS} /> : <MobileNav items={NAV_ITEMS} />}
        <main id="conteudo" tabIndex={-1} className="min-w-0 flex-1 outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
