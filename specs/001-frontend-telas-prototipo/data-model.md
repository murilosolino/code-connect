# Data Model — Telas do frontend (dados em memória)

Tipos de domínio do frontend (`src/data/types.ts`). Nesta etapa vivem só em memória, inicializados
pelo seed (`src/data/seed.ts`); a forma foi escolhida para ser a mesma que a API vai devolver
depois. `Handle` é sempre guardado **sem** `@` (`'julio'`); o `@` é só de exibição.

## Entidades

### User

| Campo | Tipo | Regras |
| --- | --- | --- |
| `handle` | `string` | Único, minúsculo, sem `@`. Chave do perfil (`/perfil/:handle`). |
| `name` | `string` | Nome exibido no perfil (ex.: "Júlio Oliveira"). |
| `initials` | `string` | 1–2 letras para o avatar sem foto ("JO", "A"). |
| `avatarUrl?` | `string` | Opcional; sem ele o `Avatar` mostra `initials`. |
| `bio?` | `string` | Opcional; oculta no perfil quando ausente. |
| `connections` | `number` | ≥ 0. Base para "Conexões" (+1 quando a pessoa logada segue). |

Derivados (não armazenados): `projectsCount` = nº de `Post` com `authorHandle === handle`.

### Post (Projeto)

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | `string` | Único; slug no seed (`'vendas'`), `novo-<n>` para publicados. Chave de `/projeto/:id`. |
| `title` | `string` | Obrigatório, sem espaços nas pontas. |
| `summary` | `string` | Descrição curta exibida no card do feed/perfil. |
| `description` | `string` | Descrição completa no detalhe (no seed, igual a `summary` exceto `vendas`). Projetos publicados usam o mesmo texto nos dois. |
| `tags` | `string[]` | Sem vazias; sem duplicadas (comparação sem caixa/acentos). Pode ser vazia. |
| `code?` | `string` | Trecho exibido pelo `CodeEditor` quando não há imagem. |
| `imageUrl?` | `string` | URL de objeto da imagem carregada (só projetos publicados). |
| `authorHandle` | `string` | Referência a `User.handle`. |
| `approvals` | `number` | ≥ 0. Já inclui a aprovação da pessoa logada se ela aprovou no seed. |
| `shares` | `number` | ≥ 0. Só exibição nesta etapa. |

Derivados: `commentCount` = nº de `Comment` de primeiro nível do post; `approvedByViewer` =
`viewer.approvedPostIds` contém `id`. Sem `imageUrl` nem `code`, a mídia do card mostra só a área
`bg-card-media` com o ícone `code` centralizado (o mesmo espaço reservado da tela Publicar, sem o
texto de instrução de upload).

### Comment

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | `string` | Único. |
| `postId` | `string` | Referência a `Post.id`. |
| `authorHandle` | `string` | `'voce'` para comentários criados na sessão. |
| `authorInitials` | `string` | Inicial do avatar ("V" para `@voce`). |
| `text` | `string` | Obrigatório após `trim()`. |
| `replies` | `Reply[]` | Um nível só; ordem de exibição = ordem do array. |

### Reply

| Campo | Tipo | Regras |
| --- | --- | --- |
| `id` | `string` | Único. |
| `authorHandle` | `string` | |
| `authorInitials` | `string` | |
| `text` | `string` | |

### Viewer (pessoa logada de exemplo)

| Campo | Tipo | Regras |
| --- | --- | --- |
| `handle` | `'julio'` | Fixo nesta etapa (`src/data/viewer.ts`). |
| `approvedPostIds` | `string[]` | Seed: `['auth', 'tarefas']` → aba "Aprovados" do perfil. |
| `followingHandles` | `string[]` | Seed: `[]`. |

## Relacionamentos

```text
User 1 ──── * Post        (Post.authorHandle)
Post 1 ──── * Comment     (Comment.postId)
Comment 1 ─ * Reply       (embutido)
Viewer * ── * Post        (approvedPostIds — aprovações)
Viewer * ── * User        (followingHandles — seguir)
```

## Estado do store (`AppState`)

```text
AppState {
  users:    Record<handle, User>
  posts:    Post[]              // ordem = "Recentes" (mais novo primeiro)
  comments: Record<postId, Comment[]>
  viewer:   Viewer
  nextId:   number              // gera o id novo-<n> dos projetos publicados
}
```

## Ações e transições (reducer puro)

| Ação | Payload | Efeito |
| --- | --- | --- |
| `toggleApproval` | `postId` | Alterna `postId` em `viewer.approvedPostIds` e soma ±1 em `post.approvals`. Id inexistente: sem efeito. |
| `addComment` | `postId`, `text` | Ignora se `text.trim()` vazio. Acrescenta `{ id: '<postId>-c<n>' (n = quantidade atual + 1), authorHandle: 'voce', authorInitials: 'V', text: trim, replies: [] }` **ao fim** de `comments[postId]`. Não consome `nextId`. |
| `toggleFollow` | `handle` | Alterna `handle` em `viewer.followingHandles`. "Conexões" exibidas = `user.connections + (seguindo ? 1 : 0)`. |
| `publishPost` | `{ title, description, tags, imageUrl? }` | Cria `Post { id: novo-<n>, summary = description, authorHandle: viewer.handle, approvals: 0, shares: 0 }` **no início** de `posts`, com `comments[id] = []`. Devolve o `id` para navegar ao detalhe. |

Estados de UI que **não** vão para o store (estado local da tela): texto da busca, filtros de tag
ativos e aba do Feed; aba do Perfil; respostas abertas/fechadas por comentário (o primeiro
comentário com respostas começa aberto); rascunho do comentário; campos, tags e prévia do
formulário Publicar; marcação de "Lembrar-me".

## Regras de validação (referência)

- Projeto: `title` e `description` obrigatórios (após `trim`); imagem PNG/JPEG ≤ 5 MB quando
  houver; tags normalizadas por `trim`, sem vazias nem repetidas — FR-013, FR-025.
- Login/Cadastro: ver FR-025 (não geram entidades; só navegam para `/`).
- Comentário: `text.trim()` não vazio — US2-4.
