import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AuthScreen } from '../components/layout/AuthScreen'
import { SocialLoginButtons } from '../components/layout/SocialLoginButtons'
import { Button, Checkbox, TextField, TextLink } from '../components/ui'
import { useFormValidation } from '../hooks/useFormValidation'
import { usePageTitle } from '../hooks/usePageTitle'
import { loginSchema } from '../lib/validation'

const BANNER = {
  code: "const comunidade = conectar({\n  linguagens: ['js', 'py', 'go'],\n  aberta: true,\n});\n\ncomunidade.publicar(seuProjeto);",
  highlight: ['const', 'true'],
  phrase: 'Compartilhe seu código. Receba comentários. Conecte-se.',
}

/** Login visual: valida os campos e segue para o feed; não há autenticação real nesta etapa. */
export function LoginPage() {
  usePageTitle('Login')
  const navigate = useNavigate()
  const form = useFormValidation(loginSchema)
  const [remember, setRemember] = useState(false)

  const handleSubmit = form.handleSubmit(() => navigate('/'))

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
              {/* Ainda não há fluxo de recuperação (FR-017): o link fica na própria tela. */}
              <TextLink variant="form" to="/login">
                Esqueci a senha
              </TextLink>
            </div>
          </div>
        </div>
        <Button variant="primary" type="submit" icon="arrow_forward">
          Login
        </Button>
      </form>
      <SocialLoginButtons to="/" />
    </AuthScreen>
  )
}
