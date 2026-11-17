import type { ReactNode } from 'react'

/** Título (`h1`) das telas de conteúdo: 31px no mobile e 37px no desktop (Publicar, Sobre nós). */
export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-subtitle-large font-medium text-text-primary lg:text-heading-small">
      {children}
    </h1>
  )
}
