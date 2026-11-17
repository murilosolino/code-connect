import { useState } from 'react'
import { AuthScreen } from '../components/layout/AuthScreen'
import { Button, Checkbox, FieldError, TextField, TextLink } from '../components/ui'
import { useAuth } from '../data/auth/useAuth'
import { useFormValidation } from '../hooks/useFormValidation'
import { usePageTitle } from '../hooks/usePageTitle'
import { fieldErrorsFrom, GENERAL_ERROR_MESSAGE } from '../lib/api'
import { loginSchema } from '../lib/validation'

const BANNER = {
  code: "const comunidade = conectar({\n  linguagens: ['js', 'py', 'go'],\n  aberta: true,\n});\n\ncomunidade.publicar(seuProjeto);",
  highlight: ['const', 'true'],
  phrase: 'Compartilhe seu código. Receba comentários. Conecte-se.',
}

const FORM_ERROR_ID = 'login-erro'

/**
 * Login com email ou usuário. Ao entrar, a rota (`RedirectIfAuthenticated`) leva a pessoa
 * à tela que pediu o login ou ao feed.
 */
export function LoginPage() {
  usePageTitle('Login')
  const { login } = useAuth()
  const form = useFormValidation(loginSchema)
  const [remember, setRemember] = useState(false)
  const [formError, setFormError] = useState<string>()

  const handleSubmit = form.handleSubmit(async ({ identifier, password }) => {
    setFormError(undefined)
    try {
      await login({ identifier: identifier.trim(), password, remember })
    } catch (error) {
      const fields = fieldErrorsFrom(error, ['identifier', 'password'] as const)
      if (fields) form.setFieldErrors(fields)
      else setFormError(GENERAL_ERROR_MESSAGE)
    }
  })

  return (
    <AuthScreen
      banner={BANNER}
      title="Login"
      subtitle="Boas-vindas! Faça seu login."
      footer={
        <p className="text-paragraph text-text-primary">
          Ainda não tem conta?{' '}
          <TextLink variant="accent" to="/cadastro">
            Crie seu cadastro!
          </TextLink>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
        <div className="flex flex-col gap-6">
          <TextField label="Email ou usuário" placeholder="usuario123" {...form.register('identifier')} />
          <div className="flex flex-col gap-2">
            <TextField label="Senha" type="password" placeholder="******" {...form.register('password')} />
            <div className="flex items-center justify-between gap-4">
              <Checkbox label="Lembrar-me" checked={remember} onChange={setRemember} />
              {/* Ainda não há fluxo de recuperação: o link fica na própria tela. */}
              <TextLink variant="form" to="/login">
                Esqueci a senha
              </TextLink>
            </div>
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
            Login
          </Button>
        </div>
      </form>
    </AuthScreen>
  )
}
