/**
 * Tipos de domínio do frontend.
 * Nesta etapa vivem só em memória; a forma é a mesma que a API vai devolver depois.
 */

export type User = {
  /** Único, minúsculo, sem "@". Chave do perfil (`/perfil/:handle`). */
  handle: string
  name: string
  /** 1–2 letras do avatar sem foto. */
  initials: string
  avatarUrl?: string
  bio?: string
  /** ≥ 0. Base de "Conexões" (+1 quando a pessoa logada segue). */
  connections: number
}

export type Post = {
  /** Único; slug no seed (`vendas`), `novo-<n>` nos publicados. Chave de `/projeto/:id`. */
  id: string
  title: string
  /** Descrição curta do card. */
  summary: string
  /** Descrição completa do detalhe. */
  description: string
  /** Sem vazias, sem duplicadas. */
  tags: string[]
  /** Trecho exibido quando não há imagem. */
  code?: string
  /** URL de objeto da imagem carregada (só projetos publicados). */
  imageUrl?: string
  authorHandle: string
  approvals: number
  shares: number
}

export type Reply = {
  id: string
  authorHandle: string
  authorInitials: string
  text: string
}

export type Comment = {
  id: string
  postId: string
  authorHandle: string
  authorInitials: string
  text: string
  /** Um nível só. */
  replies: Reply[]
}

/** Pessoa logada de exemplo. */
export type Viewer = {
  handle: string
  approvedPostIds: string[]
  followingHandles: string[]
}

/** Pessoa autenticada, como a API devolve em `/auth/me`. */
export type AuthViewer = {
  handle: string
  name: string
  initials: string
  avatarUrl: string | null
}

export type AppState = {
  users: Record<string, User>
  /** Ordem = "Recentes" (mais novo primeiro). */
  posts: Post[]
  comments: Record<string, Comment[]>
  viewer: Viewer
  /** Gera o id `novo-<n>` dos projetos publicados. */
  nextId: number
}

export type PostView = Post & {
  author: User
  /** Comentários de primeiro nível (respostas não contam). */
  commentCount: number
  approvedByViewer: boolean
}

export type UserView = User & {
  projectsCount: number
  connectionsDisplayed: number
  followedByViewer: boolean
}
