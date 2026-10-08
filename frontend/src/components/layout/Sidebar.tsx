import { Button, Logo, Surface } from '../ui'
import { NavItem } from './NavItem'
import type { NavEntry } from './navigation'

type Props = { items: NavEntry[] }

/** Menu lateral do desktop: logo, botão "Publicar" e os itens de navegação. */
export function Sidebar({ items }: Props) {
  return (
    <Surface padding="menu" className="flex w-60 shrink-0 flex-col items-center gap-20 self-start">
      <Logo />
      <nav aria-label="Navegação principal" className="flex w-full flex-col items-center gap-10">
        <Button variant="secondary" size="lg" fullWidth to="/publicar">
          Publicar
        </Button>
        <ul className="flex flex-col items-center gap-10">
          {items.map((entry) => (
            <li key={entry.to}>
              <NavItem entry={entry} layout="sidebar" />
            </li>
          ))}
        </ul>
      </nav>
    </Surface>
  )
}
