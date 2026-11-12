import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Checkbox } from './Checkbox'

function Controlled({ initial = false }: { initial?: boolean }) {
  const [checked, setChecked] = useState(initial)
  return <Checkbox label="Lembrar-me" checked={checked} onChange={setChecked} />
}

describe('Checkbox', () => {
  it('é um checkbox de verdade, com o rótulo associado', () => {
    render(<Controlled />)
    const checkbox = screen.getByRole('checkbox', { name: 'Lembrar-me' })
    expect(checkbox.tagName).toBe('INPUT')
    expect(checkbox).not.toBeChecked()
  })

  it('o clique alterna o estado', async () => {
    const user = userEvent.setup()
    render(<Controlled />)
    await user.click(screen.getByRole('checkbox', { name: 'Lembrar-me' }))
    expect(screen.getByRole('checkbox', { name: 'Lembrar-me' })).toBeChecked()
    await user.click(screen.getByLabelText('Lembrar-me'))
    expect(screen.getByRole('checkbox', { name: 'Lembrar-me' })).not.toBeChecked()
  })

  it('a tecla Espaço alterna o estado quando o checkbox tem o foco', async () => {
    const user = userEvent.setup()
    render(<Controlled />)
    await user.tab()
    expect(screen.getByRole('checkbox')).toHaveFocus()
    await user.keyboard(' ')
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('clicar no texto do rótulo também alterna', async () => {
    const user = userEvent.setup()
    render(<Controlled />)
    await user.click(screen.getByText('Lembrar-me'))
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('o ícone de marcado só aparece quando marcado e é escondido dos leitores de tela', async () => {
    const user = userEvent.setup()
    const { container } = render(<Controlled />)
    expect(container.querySelector('.material-icon')).not.toBeInTheDocument()

    await user.click(screen.getByRole('checkbox'))
    const icon = container.querySelector('.material-icon')
    expect(icon).toHaveTextContent('check')
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })

  it('começa marcado quando recebe checked', () => {
    render(<Controlled initial />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })
})
