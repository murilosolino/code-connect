import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createSeedState } from '../../data/seed'
import { usePost } from '../../data/store/hooks'
import { selectPostView } from '../../data/store/selectors'
import type { PostView } from '../../data/types'
import { renderWithProviders } from '../../test/renderWithProviders'
import { PostCard } from './PostCard'

const state = createSeedState()
const vendas = selectPostView(state, 'vendas')!

describe('PostCard (feed)', () => {
  it('mostra o título como link para o detalhe, dentro de um heading', () => {
    renderWithProviders(<PostCard post={vendas} size="feed" />)
    const heading = screen.getByRole('heading', { level: 2 })
    expect(within(heading).getByRole('link', { name: vendas.title })).toHaveAttribute(
      'href',
      '/projeto/vendas',
    )
  })

  it('a mídia também leva ao detalhe', () => {
    renderWithProviders(<PostCard post={vendas} size="feed" />)
    expect(
      screen.getByRole('link', { name: `Abrir projeto ${vendas.title}` }),
    ).toHaveAttribute('href', '/projeto/vendas')
  })

  it('mostra a descrição curta, as tags em prévia (sem botão remover) e o autor', () => {
    renderWithProviders(<PostCard post={vendas} size="feed" />)
    expect(screen.getByText(vendas.summary)).toBeInTheDocument()
    const tags = screen.getByRole('list', { name: 'Tags do projeto' })
    expect(within(tags).getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      'React',
      'TypeScript',
      'Vite',
    ])
    expect(within(tags).queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: '@julio' })).toHaveAttribute('href', '/perfil/julio')
  })

  it('o trecho de código tem nome acessível', () => {
    renderWithProviders(<PostCard post={vendas} size="feed" />)
    expect(
      screen.getByRole('img', { name: `Trecho de código do projeto ${vendas.title}` }),
    ).toBeInTheDocument()
  })

  it('o link de comentários leva ao detalhe e mostra o contador', () => {
    renderWithProviders(<PostCard post={vendas} size="feed" />)
    expect(screen.getByRole('link', { name: 'Comentários 3' })).toHaveAttribute(
      'href',
      '/projeto/vendas',
    )
  })

  it('aprovar atualiza o contador e o estado em aria-pressed (estado compartilhado)', async () => {
    function Connected() {
      const post = usePost('vendas')!
      return <PostCard post={post} size="feed" />
    }
    const { user } = renderWithProviders(<Connected />)

    await user.click(screen.getByRole('button', { name: 'Aprovar 32' }))
    expect(screen.getByRole('button', { name: 'Aprovar 33' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Aprovar 33' }))
    expect(screen.getByRole('button', { name: 'Aprovar 32' })).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('PostCard (página)', () => {
  it('mostra a descrição completa e o título sem link', () => {
    renderWithProviders(<PostCard post={vendas} size="page" headingLevel={1} />)
    expect(screen.getByRole('heading', { level: 1, name: vendas.title })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: vendas.title })).not.toBeInTheDocument()
    expect(screen.getByText(vendas.description)).toBeInTheDocument()
    expect(screen.queryByText(vendas.summary, { exact: true })).not.toBeInTheDocument()
  })

  it('não tem link na mídia nem nos comentários (já está no detalhe)', () => {
    renderWithProviders(<PostCard post={vendas} size="page" headingLevel={1} />)
    expect(screen.queryByRole('link', { name: /^Abrir projeto/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^Comentários/ })).not.toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })
})

describe('PostCard (mídia)', () => {
  const withoutCode: PostView = { ...vendas, code: undefined }

  it('com imagem carregada mostra a <img> com texto alternativo', () => {
    const post: PostView = { ...withoutCode, imageUrl: 'blob:abc' }
    renderWithProviders(<PostCard post={post} size="feed" />)
    expect(screen.getByRole('img', { name: `Imagem do projeto ${vendas.title}` })).toHaveAttribute(
      'src',
      'blob:abc',
    )
  })

  it('sem imagem nem código mostra o espaço reservado, sem textos de instrução', () => {
    const { container } = renderWithProviders(<PostCard post={withoutCode} size="feed" />)
    expect(container.querySelector('pre')).not.toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.queryByText(/Carregue uma imagem/)).not.toBeInTheDocument()
  })
})
