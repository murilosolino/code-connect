/** Devolve a mensagem de erro, ou null quando o valor é válido. */
export type Rule = (value: string) => string | null

/** Regras por campo, avaliadas na ordem declarada. */
export type Schema<K extends string> = Record<K, Rule[]>

export type FormErrors<K extends string> = Partial<Record<K, string>>

export const required =
  (message: string): Rule =>
  (value) =>
    value.trim() === '' ? message : null

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const email =
  (message: string): Rule =>
  (value) =>
    EMAIL_PATTERN.test(value.trim()) ? null : message

/** Aplica o schema e devolve só os campos com erro (a primeira regra que falhar de cada um). */
export function validate<K extends string>(
  schema: Schema<K>,
  values: Record<K, string>,
): FormErrors<K> {
  const errors: FormErrors<K> = {}
  for (const field of Object.keys(schema) as K[]) {
    for (const rule of schema[field]) {
      const message = rule(values[field])
      if (message) {
        errors[field] = message
        break
      }
    }
  }
  return errors
}

/** Formulário "Novo projeto". */
export const projectSchema = {
  title: [required('Informe o nome do projeto.')],
  description: [required('Informe a descrição do projeto.')],
} satisfies Schema<'title' | 'description'>

/** Login. */
export const loginSchema = {
  identifier: [required('Informe seu email ou usuário.')],
  password: [required('Informe sua senha.')],
} satisfies Schema<'identifier' | 'password'>

/** Cadastro. */
export const signupSchema = {
  name: [required('Informe seu nome.')],
  email: [required('Informe seu email.'), email('Digite um email válido.')],
  password: [required('Informe sua senha.')],
} satisfies Schema<'name' | 'email' | 'password'>
