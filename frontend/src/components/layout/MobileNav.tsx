import { Button, Logo, Surface } from '../ui'
import { NavItem } from './NavItem'
import type { NavEntry } from './navigation'

type Props = { items: NavEntry[] }

/**
 * Navegação do tablet e do mobile: linha com o logo e o botão "Publicar" e, abaixo,
 * a barra horizontal com os itens (rótulos de 18px no mobile e 22px no tablet).
 */
export function MobileNav({ items }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Logo />
        <Button variant="secondary" to="/publicar">
          Publicar
        </Button>
      </div>
      <Surface as="div" className="px-4 py-6 sm:px-15 sm:py-10">
        <nav aria-label="Navegação principal">
          <ul className="flex items-center justify-between gap-2">
            {items.map((entry) => (
              <li key={entry.to}>
                <NavItem entry={entry} layout="bar" />
              </li>
            ))}
          </ul>
        </nav>
      </Surface>
    </div>
  )
}
