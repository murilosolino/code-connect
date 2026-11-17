import { Link } from 'react-router'

type Props = {
  /** Link para o feed; Login e Cadastro mostram o logo sem link, como nos protótipos. */
  linked?: boolean
}

const classes = 'text-subtitle font-semibold text-text-primary'

/** Texto "CodeConnect" até chegar o logo oficial do Figma. */
export function Logo({ linked = true }: Props) {
  return linked ? (
    <Link to="/" className={`${classes} no-underline`}>
      CodeConnect
    </Link>
  ) : (
    <span className={classes}>CodeConnect</span>
  )
}
