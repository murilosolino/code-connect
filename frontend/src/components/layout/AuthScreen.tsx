import type { ReactNode } from 'react'
import { CodeEditor, Logo, MediaPanel } from '../ui'

type Props = {
  banner: {
    code: string
    /** Palavras do código destacadas em verde. */
    highlight?: string[]
    /** Frase ao lado do editor (só no desktop). */
    phrase: string
  }
  title: string
  subtitle: string
  /** Formulário e botões. */
  children: ReactNode
  footer: ReactNode
}

/**
 * Tela de Login e Cadastro (sem menu). Desktop: card de duas colunas, banner à esquerda e o
 * formulário à direita. Abaixo de 1024px: coluna única, logo no topo e banner reduzido.
 * A mesma ordem do HTML (logo, banner, formulário) serve aos dois layouts.
 */
export function AuthScreen({ banner, title, subtitle, children, footer }: Props) {
  return (
    <main className="min-h-screen bg-bg-page px-4 py-6 lg:flex lg:items-center lg:justify-center lg:py-10">
      <div className="mx-auto flex w-full max-w-275 flex-col gap-8 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-0 lg:overflow-hidden lg:rounded-md lg:bg-bg-surface">
        <div className="text-center lg:col-start-2 lg:row-start-1 lg:px-12 lg:pt-14 lg:text-left">
          <Logo linked={false} />
        </div>
        <MediaPanel
          padding="md"
          className="flex flex-col justify-center gap-8 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:rounded-none lg:px-10 lg:py-12"
        >
          <CodeEditor size="banner" decorative code={banner.code} highlight={banner.highlight} />
          <p className="hidden text-subtitle font-semibold text-cinza-escuro lg:block">{banner.phrase}</p>
        </MediaPanel>
        <div className="flex flex-col gap-8 lg:col-start-2 lg:row-start-2 lg:px-12 lg:pt-8 lg:pb-14">
          <header className="flex flex-col gap-2">
            <h1 className="text-heading-small font-medium text-text-primary">{title}</h1>
            <p className="text-paragraph text-text-secondary lg:text-paragraph-large">{subtitle}</p>
          </header>
          {children}
          {footer}
        </div>
      </div>
    </main>
  )
}
