import { useState } from 'react'
import { AuthScreen } from '../components/layout/AuthScreen'
import { Button, Checkbox, FieldError, TextField, TextLink } from '../components/ui'
import { useAuth } from '../data/auth/useAuth'
import { useFormValidation } from '../hooks/useFormValidation'
import { usePageTitle } from '../hooks/usePageTitle'
import { fieldErrorsFrom, GENERAL_ERROR_MESSAGE } from '../lib/api'
import { signupSchema } from '../lib/validation'

const BANNER = {
  code: "const perfil = criarPerfil({\n  nome: 'Você',\n  stack: ['React', 'Node.js'],\n});\nperfil.seguir('@comunidade');",
  highlight: ['const'],
  phrase: 'Crie sua conta e mostre o código por trás dos seus projetos.',
}

const FORM_ERROR_ID = 'cadastro-erro'

/** Cadastro: cria a conta e já abre a sessão; a rota leva a pessoa ao feed. */
export function SignupPage() {
  usePageTitle('Cadastro')
  const { signup } = useAuth()
  const form = useFormValidation(signupSchema)
  const [remember, setRemember] = useState(false)
  const [formError, setFormError] = useState<string>()

  const handleSubmit = form.handleSubmit(async ({ name, email, password }) => {
    setFormError(undefined)
    try {
      await signup({ name: name.trim(), email: email.trim(), password, remember })
    } catch (error) {
      const fields = fieldErrorsFrom(error, ['name', 'email', 'password'] as const)
      if (fields) form.setFieldErrors(fields)
      else setFormError(GENERAL_ERROR_MESSAGE)
    }
  })

  return (
    <AuthScreen
      banner={BANNER}
      title="Cadastro"
      subtitle="Olá! Preencha seus dados."
      footer={
        <p className="text-paragraph text-text-primary">
          Já tem conta?{' '}
          <TextLink variant="accent" to="/login">
            Faça seu login!
          </TextLink>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          <TextField label="Nome" placeholder="Nome completo" {...form.register('name')} />
          <TextField label="Email" type="email" placeholder="voce@email.com" {...form.register('email')} />
          <div className="flex flex-col gap-2">
            <TextField label="Senha" type="password" placeholder="******" {...form.register('password')} />
            <Checkbox label="Lembrar-me" checked={remember} onChange={setRemember} />
          </div>
        </div>
        <div>
          <FieldError id={FORM_ERROR_ID} message={formError} />
          <Button
            variant="primary"
            type="submit"
            icon="arrow_forward"
            fullWidth
            disabled={form.submitting}
            aria-describedby={formError ? FORM_ERROR_ID : undefined}
          >
            Cadastrar
          </Button>
        </div>
      </form>
    </AuthScreen>
  )
}
