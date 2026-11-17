import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SearchBox } from './SearchBox'

describe('SearchBox', () => {
  it('é um campo de busca com rótulo acessível e o placeholder do design', () => {
    render(<SearchBox label="Buscar projetos" value="" onChange={() => {}} />)
    const input = screen.getByRole('searchbox', { name: 'Buscar projetos' })
    expect(input).toHaveAttribute('placeholder', 'Digite o que você procura')
  })

  it('chama onChange com o texto digitado', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<SearchBox label="Buscar projetos" value="" onChange={onChange} />)
    await user.type(screen.getByRole('searchbox'), 'a')
    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('mostra o valor recebido', () => {
    render(<SearchBox label="Buscar projetos" value="react" onChange={() => {}} />)
    expect(screen.getByRole('searchbox')).toHaveValue('react')
  })
})
