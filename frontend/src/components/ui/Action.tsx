import type { ComponentPropsWithRef } from 'react'
import { Link } from 'react-router'

/**
 * Base polimórfica de tudo que é clicável: navegação é sempre link (`to`) e ação é sempre
 * botão. Interno: use `Button`, `TextLink` ou `NavItem`.
 */
export type ActionProps =
  | ({ to: string } & Omit<ComponentPropsWithRef<typeof Link>, 'to'>)
  | ({ to?: undefined } & ComponentPropsWithRef<'button'>)

export function Action(props: ActionProps) {
  if (props.to !== undefined) {
    return <Link {...props} />
  }
  const { type = 'button', ...rest } = props as ComponentPropsWithRef<'button'>
  return <button type={type} {...rest} />
}
