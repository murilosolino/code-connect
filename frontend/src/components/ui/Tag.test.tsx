import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Tag } from './Tag'

describe('Tag', () => {
  it('sem onRemove é só uma prévia, sem botão', () => {
    render(<Tag label="React" />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('com onRemove mostra o botão "Remover <rótulo>" que o chama', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<Tag label="React" onRemove={onRemove} />)
    await user.click(screen.getByRole('button', { name: 'Remover React' }))
    expect(onRemove).toHaveBeenCalledTimes(1)
  })
})
