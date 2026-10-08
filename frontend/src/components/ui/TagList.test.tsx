import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TagList } from './TagList'

describe('TagList', () => {
  it('renderiza uma lista nomeada com um item por tag', () => {
    render(<TagList label="Tags do projeto" tags={['React', 'Vite']} />)
    const list = screen.getByRole('list', { name: 'Tags do projeto' })
    expect(within(list).getAllByRole('listitem')).toHaveLength(2)
  })

  it('repassa a tag removida a onRemove', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<TagList label="Filtros" tags={['React', 'Vite']} onRemove={onRemove} />)
    await user.click(screen.getByRole('button', { name: 'Remover Vite' }))
    expect(onRemove).toHaveBeenCalledWith('Vite')
  })

  it('não renderiza nada quando não há tags', () => {
    render(<TagList label="Filtros" tags={[]} />)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
