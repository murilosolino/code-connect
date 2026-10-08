import { useState } from 'react'
import { useNavigate } from 'react-router'
import { AuthScreen } from '../components/layout/AuthScreen'
import { SocialLoginButtons } from '../components/layout/SocialLoginButtons'
import { Button, Checkbox, TextField, TextLink } from '../components/ui'
import { useFormValidation } from '../hooks/useFormValidation'
import { usePageTitle } from '../hooks/usePageTitle'
import { signupSchema } from '../lib/validation'

const BANNER = {
  code: "const perfil = criarPerfil({\n  nome: 'Você',\n  stack: ['React', 'Node.js'],\n});\nperfil.seguir('@comunidade');",
  highlight: ['const'],
  phrase: 'Crie sua conta e mostre o código por trás dos seus projetos.',
}

/** Cadastro visual: valida os campos e segue para o feed; não cria conta nesta etapa. */
export function SignupPage() {
  usePageTitle('Cadastro')
  const navigate = useNavigate()
  const form = useFormValidation(signupSchema)
  const [remember, setRemember] = useState(false)

  const handleSubmit = form.handleSubmit(() => navigate('/'))

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
        <Button variant="primary" type="submit" icon="arrow_forward">
          Cadastrar
        </Button>
      </form>
      <SocialLoginButtons to="/" />
    </AuthScreen>
  )
}
