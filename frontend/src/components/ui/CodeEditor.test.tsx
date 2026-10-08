import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CodeEditor } from './CodeEditor'

const code = 'const a = 1;'

describe('CodeEditor', () => {
  it('mostra o código num <pre>', () => {
    render(<CodeEditor code={code} label="Trecho de código do projeto Vendas" />)
    expect(screen.getByText(code).tagName).toBe('PRE')
  })

  it('com `label` é exposto como imagem com esse nome', () => {
    render(<CodeEditor code={code} label="Trecho de código do projeto Vendas" />)
    expect(screen.getByRole('img', { name: 'Trecho de código do projeto Vendas' })).toBeInTheDocument()
  })

  it('com `decorative` fica escondido dos leitores de tela', () => {
    const { container } = render(<CodeEditor code={code} decorative />)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })
})
