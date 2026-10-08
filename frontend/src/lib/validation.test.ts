import { describe, expect, it } from 'vitest'
import { email, loginSchema, projectSchema, required, signupSchema, validate } from './validation'

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

describe('projectSchema', () => {
  it('exige o nome do projeto e a descrição', () => {
    expect(validate(projectSchema, { title: '', description: '' })).toEqual({
      title: 'Informe o nome do projeto.',
      description: 'Informe a descrição do projeto.',
    })
  })

  it('trata só espaços como vazio', () => {
    expect(validate(projectSchema, { title: '   ', description: ' ok ' })).toEqual({
      title: 'Informe o nome do projeto.',
    })
  })

  it('aceita nome e descrição preenchidos', () => {
    expect(validate(projectSchema, { title: 'Meu projeto', description: 'Uma descrição' })).toEqual({})
  })
})

describe('loginSchema', () => {
  it('exige email ou usuário e senha', () => {
    expect(validate(loginSchema, { identifier: '', password: '' })).toEqual({
      identifier: 'Informe seu email ou usuário.',
      password: 'Informe sua senha.',
    })
  })

  it('aceita um usuário que não é email', () => {
    expect(validate(loginSchema, { identifier: 'usuario123', password: 'x' })).toEqual({})
  })
})

describe('signupSchema', () => {
  it('exige nome, email e senha', () => {
    expect(validate(signupSchema, { name: '', email: '', password: '' })).toEqual({
      name: 'Informe seu nome.',
      email: 'Informe seu email.',
      password: 'Informe sua senha.',
    })
  })

  it('valida o formato do email', () => {
    expect(validate(signupSchema, { name: 'Ana', email: 'ana@', password: 'x' })).toEqual({
      email: 'Digite um email válido.',
    })
  })

  it('aceita os dados preenchidos', () => {
    expect(validate(signupSchema, { name: 'Ana', email: 'ana@ex.com', password: 'x' })).toEqual({})
  })
})
