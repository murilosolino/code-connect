import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Tabs } from './Tabs'

const items = [
  { id: 'recentes', label: 'Recentes' },
  { id: 'populares', label: 'Populares' },
]

function Controlled({ onChange = () => {} }: { onChange?: (id: string) => void }) {
  const [value, setValue] = useState('recentes')
  return (
    <Tabs
      label="Ordenar projetos"
      panelId="painel"
      items={items}
      value={value}
      onChange={(id) => {
        setValue(id)
        onChange(id)
      }}
    />
  )
}

describe('Tabs', () => {
  it('é um tablist nomeado com uma aba por item', () => {
    render(<Controlled />)
    expect(screen.getByRole('tablist', { name: 'Ordenar projetos' })).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(2)
  })

  it('marca só a aba atual como selecionada e tabulável, ligada ao painel', () => {
    render(<Controlled />)
    const recentes = screen.getByRole('tab', { name: 'Recentes' })
    const populares = screen.getByRole('tab', { name: 'Populares' })
    expect(recentes).toHaveAttribute('aria-selected', 'true')
    expect(recentes).toHaveAttribute('tabindex', '0')
    expect(recentes).toHaveAttribute('aria-controls', 'painel')
    expect(populares).toHaveAttribute('aria-selected', 'false')
    expect(populares).toHaveAttribute('tabindex', '-1')
  })

  it('chama onChange com o id ao clicar', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Controlled onChange={onChange} />)
    await user.click(screen.getByRole('tab', { name: 'Populares' }))
    expect(onChange).toHaveBeenCalledWith('populares')
    expect(screen.getByRole('tab', { name: 'Populares' })).toHaveAttribute('aria-selected', 'true')
  })

  it('a seta → move o foco e ativa a próxima aba; a ← volta (com volta circular)', async () => {
    const user = userEvent.setup()
    render(<Controlled />)
    await user.tab()
    expect(screen.getByRole('tab', { name: 'Recentes' })).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Populares' })).toHaveFocus()
    expect(screen.getByRole('tab', { name: 'Populares' })).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Recentes' })).toHaveFocus()

    await user.keyboard('{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'Populares' })).toHaveFocus()
  })
})
