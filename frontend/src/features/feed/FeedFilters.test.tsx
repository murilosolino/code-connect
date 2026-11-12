import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FeedFilters } from './FeedFilters'

function setup(tags: string[]) {
  const handlers = { onRemove: vi.fn(), onClear: vi.fn(), onRestore: vi.fn() }
  render(<FeedFilters tags={tags} {...handlers} />)
  return { user: userEvent.setup(), ...handlers }
}

describe('FeedFilters', () => {
  it('lista os filtros aplicados, cada um removível', async () => {
    const { user, onRemove } = setup(['Front-end', 'React'])
    expect(screen.getByRole('list', { name: 'Filtros aplicados' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remover filtro React' }))
    expect(onRemove).toHaveBeenCalledWith('React')
  })

  it('"Limpar tudo" é uma ação (botão) que chama onClear', async () => {
    const { user, onClear } = setup(['React'])
    await user.click(screen.getByRole('button', { name: 'Limpar tudo' }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('sem filtros mostra "Nenhum filtro aplicado." e "Restaurar filtros"', async () => {
    const { user, onRestore } = setup([])
    expect(screen.getByText('Nenhum filtro aplicado.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Limpar tudo' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Restaurar filtros' }))
    expect(onRestore).toHaveBeenCalledTimes(1)
  })
})
