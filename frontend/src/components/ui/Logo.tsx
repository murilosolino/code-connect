import { Link } from 'react-router'

/** Texto "CodeConnect" até chegar o logo oficial do Figma (FR-024). */
export function Logo() {
  return (
    <Link to="/" className="text-subtitle font-semibold text-text-primary no-underline">
      CodeConnect
    </Link>
  )
}
