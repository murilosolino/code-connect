import { describe, expect, it } from 'vitest'
import { email, required, validate } from './validation'

describe('required', () => {
  it('devolve a mensagem para vazio e para só espaços', () => {
    expect(required('Msg')('')).toBe('Msg')
    expect(required('Msg')('   ')).toBe('Msg')
  })

  it('devolve null quando há conteúdo', () => {
    expect(required('Msg')('x')).toBeNull()
  })
})

describe('email', () => {
  it('rejeita endereços sem domínio completo', () => {
    expect(email('Msg')('ana')).toBe('Msg')
    expect(email('Msg')('ana@')).toBe('Msg')
  })

  it('aceita um email válido', () => {
    expect(email('Msg')('ana@ex.com')).toBeNull()
  })
})

describe('validate', () => {
  const schema = {
    nome: [required('Informe o nome.')],
    email: [required('Informe o email.'), email('Email inválido.')],
    senha: [required('Informe a senha.')],
  }

  it('devolve só os campos com erro', () => {
    expect(validate(schema, { nome: 'Ana', email: 'ana@ex.com', senha: 'x' })).toEqual({})
    expect(validate(schema, { nome: '', email: 'ana@ex.com', senha: 'x' })).toEqual({
      nome: 'Informe o nome.',
    })
  })

  it('usa a primeira regra que falhar em cada campo, na ordem declarada', () => {
    expect(validate(schema, { nome: 'Ana', email: '', senha: 'x' })).toEqual({
      email: 'Informe o email.',
    })
    expect(validate(schema, { nome: 'Ana', email: 'ana@', senha: 'x' })).toEqual({
      email: 'Email inválido.',
    })
  })
})
