import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

type Size = 'card' | 'page' | 'banner'

const escapeRegExp = (word: string) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** Envolve as palavras pedidas em <span> verde. O texto resultante é o mesmo do código. */
function highlightWords(code: string, words: string[]): ReactNode {
  if (words.length === 0) return code
  const pattern = new RegExp(`\\b(${words.map(escapeRegExp).join('|')})\\b`, 'g')
  // Com grupo de captura, `split` alterna trecho comum e palavra destacada.
  return code
    .split(pattern)
    .map((part, index) =>
      index % 2 === 1 ? (
        <span key={index} className="text-accent">
          {part}
        </span>
      ) : (
        part
      ),
    )
}

const sizes = {
  /** Preenche a altura do topo do card. */
  card: 'h-full p-4',
  /** Detalhe do projeto: 320px de altura e padding 24. */
  page: 'h-80 p-6',
  /** Banners de Login, Cadastro e Sobre: padding 16 (24 no desktop). */
  banner: 'p-4 lg:p-6',
} satisfies Record<Size, string>

type Props = {
  code: string
  size?: Size
  /** Palavras a destacar em verde (ex.: `const`, `true`), sem alterar o texto do código. */
  highlight?: string[]
} & (
  | {
      /** Nome acessível: o editor é exposto como imagem (ex.: "Trecho de código do projeto X"). */
      label: string
      decorative?: false
    }
  | {
      /** Ilustração: escondida dos leitores de tela. */
      decorative: true
      label?: undefined
    }
)

/**
 * Janela de editor de código. No produto real o topo do card mostra a imagem enviada pela
 * pessoa; este componente é o marcador visual dos dados de exemplo e dos banners.
 */
export function CodeEditor({ code, size = 'card', highlight = [], label, decorative }: Props) {
  return (
    <div
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={decorative ? true : undefined}
      className={cx('flex flex-col gap-4 overflow-hidden rounded-md bg-bg-page shadow-editor', sizes[size])}
    >
      <div aria-hidden="true" className="flex gap-2">
        <span className="size-2.5 rounded-full bg-cinza" />
        <span className="size-2.5 rounded-full bg-cinza" />
        <span className="size-2.5 rounded-full bg-cinza" />
      </div>
      <pre className="m-0 overflow-hidden font-mono text-code text-cinza-claro">
        {highlightWords(code, highlight)}
      </pre>
    </div>
  )
}
