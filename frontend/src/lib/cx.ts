type ClassValue = string | false | null | undefined

/** Junta nomes de classe ignorando valores falsos (condicionais e variantes). */
export function cx(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ')
}
