/** Minúsculas, sem acentos e sem espaços nas pontas: base da busca e da comparação de tags. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('pt-BR')
    .trim()
}

/** Só a palavra: "Conexão" para 1, "Conexões" para os demais. */
export function pluralWord(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}

/** "1 Projeto" / "3 Projetos". */
export function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${pluralWord(count, singular, plural)}`
}

/** O handle é guardado sem "@"; o "@" é só de exibição. */
export function formatHandle(handle: string): string {
  return `@${handle}`
}
