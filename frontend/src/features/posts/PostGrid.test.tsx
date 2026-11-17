import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createSeedState } from '../../data/seed'
import { selectPostViews } from '../../data/store/selectors'
import { renderWithProviders } from '../../test/renderWithProviders'
import { PostGrid } from './PostGrid'

const posts = selectPostViews(createSeedState()).slice(0, 3)

describe('PostGrid', () => {
  it('renderiza uma lista nomeada com um card por projeto', () => {
    renderWithProviders(<PostGrid posts={posts} label="Projetos" empty={<p>vazio</p>} />)
    const list = screen.getByRole('list', { name: 'Projetos' })
    expect(list.children).toHaveLength(3)
    expect(screen.getAllByRole('article')).toHaveLength(3)
    posts.forEach((post) => {
      expect(screen.getByRole('link', { name: post.title })).toBeInTheDocument()
    })
  })

  it('com lista vazia renderiza só o conteúdo de `empty`', () => {
    renderWithProviders(<PostGrid posts={[]} label="Projetos" empty={<p>vazio</p>} />)
    expect(screen.getByText('vazio')).toBeInTheDocument()
    expect(screen.queryByRole('list', { name: 'Projetos' })).not.toBeInTheDocument()
  })
})
