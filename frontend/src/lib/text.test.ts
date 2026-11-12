import { describe, expect, it } from 'vitest'
import { formatHandle, normalizeText, pluralize, pluralWord } from './text'

describe('normalizeText', () => {
  it('remove acentos, espaços nas pontas e diferença de caixa', () => {
    expect(normalizeText('Autenticação ')).toBe('autenticacao')
    expect(normalizeText('  REACT')).toBe('react')
  })
})

describe('pluralize', () => {
  it('usa o singular para 1 e o plural para os demais', () => {
    expect(pluralize(1, 'Projeto', 'Projetos')).toBe('1 Projeto')
    expect(pluralize(3, 'Projeto', 'Projetos')).toBe('3 Projetos')
    expect(pluralize(0, 'Projeto', 'Projetos')).toBe('0 Projetos')
  })
})

describe('pluralWord', () => {
  it('devolve só a palavra, no singular para 1 e no plural para os demais', () => {
    expect(pluralWord(1, 'Conexão', 'Conexões')).toBe('Conexão')
    expect(pluralWord(25, 'Conexão', 'Conexões')).toBe('Conexões')
    expect(pluralWord(0, 'Conexão', 'Conexões')).toBe('Conexões')
  })
})

describe('formatHandle', () => {
  it('acrescenta o @ de exibição', () => {
    expect(formatHandle('julio')).toBe('@julio')
  })
})
