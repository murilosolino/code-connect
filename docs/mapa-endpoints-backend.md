# Mapa de endpoints do backend

O que o backend precisa oferecer para o frontend atual deixar de usar dados em memória. As rotas e
formatos ainda não implementados são uma **proposta**. As rotas 1 a 4 (autenticação) já têm contrato
no Swagger, em `/api/docs/index.html`.

**Situação atual**

- A API só tem `GET /api/health` ([router.go](../backend/internal/router/router.go)).
- O frontend não faz nenhuma chamada HTTP. Tudo vem de [seed.ts](../frontend/src/data/seed.ts) e
  é exposto pelos hooks de [hooks.ts](../frontend/src/data/store/hooks.ts).
- Não há schema: `db/` está vazio e nenhuma ferramenta de migração foi adotada.

**Legenda de acesso**

- **Pública**: não exige login.
- **Opcional**: não exige login, mas logado preenche `approvedByViewer` e `followedByViewer`.
- **Login**: sem sessão válida responde `401`.

## 1. Endpoints necessários

São 17 rotas, todas sob `/api`. O acesso segue a decisão D2 (seção 6).

| # | Rota | Acesso | Substitui no frontend |
| --- | --- | --- | --- |
| **Autenticação** | | | |
| 1 | `POST /api/auth/signup` | Pública | Envio de [SignupPage](../frontend/src/pages/SignupPage.tsx) |
| 2 | `POST /api/auth/login` | Pública | Envio de [LoginPage](../frontend/src/pages/LoginPage.tsx) |
| 3 | `POST /api/auth/logout` | Login | Item "Sair" de [navigation.ts](../frontend/src/components/layout/navigation.ts) |
| 4 | `GET /api/auth/me` | Opcional | `useViewer()`, `VIEWER_HANDLE` |
| **Projetos** | | | |
| 5 | `GET /api/posts` | Opcional | `usePosts()` |
| 6 | `GET /api/posts/:id` | Opcional | `usePost(id)` |
| 7 | `POST /api/posts` | Login | `publishPost` |
| 8 | `PUT /api/posts/:id/approval` | Login | `toggleApproval` (aprovar) |
| 9 | `DELETE /api/posts/:id/approval` | Login | `toggleApproval` (desfazer) |
| 10 | `GET /api/images/:name` | Pública | URL de objeto da prévia (`imageUrl`) |
| **Comentários** | | | |
| 11 | `GET /api/posts/:id/comments` | Pública | `useComments(postId)` |
| 12 | `POST /api/posts/:id/comments` | Login | `addComment` |
| **Pessoas** | | | |
| 13 | `GET /api/users/:handle` | Opcional | `useUser(handle)` |
| 14 | `GET /api/users/:handle/posts` | Opcional | `useUserPosts(handle).projects` |
| 15 | `GET /api/me/approved-posts` | Login | `useUserPosts(handle).approved` |
| 16 | `PUT /api/users/:handle/follow` | Login | `toggleFollow` (seguir) |
| 17 | `DELETE /api/users/:handle/follow` | Login | `toggleFollow` (deixar de seguir) |

Aprovar e seguir viram `PUT`/`DELETE` em vez de um "toggle": repetir a requisição não inverte o
estado. Isso protege contra duplo clique e reenvio.

O frontend **não** precisa de lista de tags: `TagInput` aceita texto livre e os filtros iniciais do
feed são uma constante da tela.

## 2. Mapa por tela

| Tela | Rota do frontend | Funcionalidade | Endpoint |
| --- | --- | --- | --- |
| Login | `/login` | Entrar com email ou usuário e senha, "Lembrar-me" | 2 |
| Login | `/login` | GitHub, Google | D8 |
| Login | `/login` | Esqueci a senha | Seção 4 |
| Cadastro | `/cadastro` | Criar conta, "Lembrar-me" | 1 |
| Cadastro | `/cadastro` | GitHub, Google | D8 |
| Menu | Todas internas | Link "Perfil" da pessoa logada | 4 |
| Menu | Todas internas | Sair | 3 |
| Feed | `/` | Listar projetos | 5 |
| Feed | `/` | Busca, filtros de tag, Recentes/Populares | 5 (D3) |
| Feed | `/` | Aprovar no card | 8, 9 |
| Detalhe | `/projeto/:id` | Dados do projeto, 404 | 6 |
| Detalhe | `/projeto/:id` | Aprovar | 8, 9 |
| Detalhe | `/projeto/:id` | Listar comentários e respostas | 11 |
| Detalhe | `/projeto/:id` | Comentar | 12 |
| Detalhe | `/projeto/:id` | Responder, compartilhar | Seção 4 |
| Publicar | `/publicar` | Imagem, nome, descrição, tags | 7, 10 |
| Perfil | `/perfil/:handle` | Cabeçalho, estatísticas, 404 | 13 |
| Perfil | `/perfil/:handle` | Seguir/Seguindo | 16, 17 |
| Perfil | `/perfil/:handle` | Aba "Projetos" | 14 |
| Perfil | `/perfil/:handle` | Aba "Aprovados" | 15 (só no próprio perfil) |
| Perfil | `/perfil/:handle` | Busca nas abas | Nenhum: filtra a lista já carregada |
| Sobre nós | `/sobre` | Conteúdo estático | Nenhum |

## 3. Contratos propostos

### Formatos de resposta

Seguem [types.ts](../frontend/src/data/types.ts), com `id` sempre em string.

```jsonc
// PostView (rotas 5, 6, 7, 14, 15)
{
  "id": "42",
  "title": "Dashboard de vendas com React",
  "summary": "Painel com gráficos...",
  "description": "Painel com gráficos... (texto completo)",
  "tags": ["React", "TypeScript"],
  "code": null,                        // só dados de exemplo; ver D6
  "imageUrl": "/api/images/ab12.png",  // URL relativa ou null
  "author": { "handle": "julio", "name": "Júlio Oliveira", "initials": "JO", "avatarUrl": null },
  "approvals": 32,
  "shares": 6,
  "commentCount": 3,                   // só primeiro nível; respostas não contam
  "approvedByViewer": false
}

// UserView (rota 13)
{
  "handle": "julio",
  "name": "Júlio Oliveira",
  "initials": "JO",
  "avatarUrl": null,
  "bio": "Desenvolvedor front-end...",
  "projectsCount": 3,
  "connections": 25,                   // total real; substitui connectionsDisplayed (D4)
  "followedByViewer": false
}

// Comment (rotas 11, 12); "replies" tem um nível só e vem vazio na criação
{
  "id": "7",
  "postId": "42",
  "authorHandle": "ana.souza",
  "authorInitials": "AS",
  "text": "Ficou muito limpo...",
  "replies": [{ "id": "8", "authorHandle": "julio", "authorInitials": "JO", "text": "Obrigado!" }]
}

// Viewer (rotas 1, 2, 4)
{ "handle": "julio", "name": "Júlio Oliveira", "initials": "JO", "avatarUrl": null }
```

### Detalhes por rota

| Rota | Entrada | Sucesso | Erros |
| --- | --- | --- | --- |
| 1 signup | `{ name, email, password, remember }` | `201` Viewer + sessão | `409` email já usado, `422` |
| 2 login | `{ identifier, password, remember }` | `200` Viewer + sessão | `401` credenciais, `422` |
| 3 logout | | `204` | `401` |
| 4 me | | `200` Viewer | `401` sem sessão |
| 5 lista | `q`, `tags` (repetível), `sort=recentes\|populares` | `200 { items: PostView[] }` | `400` `sort` inválido |
| 6 detalhe | | `200` PostView | `404` |
| 7 publicar | `multipart/form-data`: `title`, `description`, `tags` (repetível), `image?` | `201` PostView | `401`, `413`, `422` |
| 8 e 9 aprovação | | `200 { approvals, approvedByViewer }` | `401`, `404` |
| 10 imagem | | `200` com o `Content-Type` real | `404` |
| 11 comentários | | `200 { items: Comment[] }` | `404` projeto |
| 12 comentar | `{ text }` | `201` Comment | `401`, `404`, `422` |
| 13 pessoa | | `200` UserView | `404` |
| 14 projetos da pessoa | | `200 { items: PostView[] }` | `404` |
| 15 aprovados | | `200 { items: PostView[] }` | `401` |
| 16 e 17 seguir | | `200 { connections, followedByViewer }` | `401`, `404`, `422` seguir a si mesmo |

### Regras que hoje estão só no frontend

O backend precisa repetir todas elas, pois a constituição exige validação no servidor.

- **Ordenação**: `recentes` é mais novo primeiro. `populares` é por aprovações, com empate na ordem
  de recentes. `Post` não tem data hoje, então o banco precisa de `created_at`.
- **Busca (`q`)**: procura em título e `summary`, sem diferenciar caixa nem acentos. A collation
  `utf8mb4_0900_ai_ci`, padrão do MySQL 8 em diante, já faz isso.
- **Tags (`tags`)**: projeto com **ao menos uma** das tags, sem diferenciar caixa nem acentos.
- **Comentários**: primeiro nível do mais antigo para o mais novo; respostas na ordem de criação.
- **Aba "Aprovados"**: só projetos de outras pessoas, nunca os da própria pessoa.
- **Projeto**: `title` e `description` obrigatórios após `trim`; tags com `trim`, sem vazias e sem
  repetição, ignorando caixa e acentos.
- **Imagem**: opcional, PNG ou JPEG, até 5 MB. O tipo deve ser verificado pelo conteúdo do arquivo,
  não pelo `Content-Type` enviado.
- **Comentário**: `text` não vazio após `trim`.
- **Cadastro**: `name`, `email` e `password` obrigatórios, email com formato válido.

### Corpo de erro

A constituição pede um corpo consistente. Proposta:

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Confira os campos destacados.",
    "fields": { "title": "Informe o nome do projeto." }
  }
}
```

As chaves de `fields` são os nomes dos campos dos formulários (`identifier`, `password`, `name`,
`email`, `title`, `description`, `image`) e as mensagens são as de
[validation.ts](../frontend/src/lib/validation.ts). `400` fica para corpo
malformado e `422` para regra de validação.

## 4. Itens na tela sem comportamento definido

Aparecem na interface, mas os protótipos não definem o fluxo. A constituição proíbe inventar essas
lacunas, então precisam de confirmação antes de virar endpoint.

| Item | Situação no frontend | Endpoint provável, se confirmado |
| --- | --- | --- |
| Responder comentário | Botão sem ação; as respostas existentes são exibidas | `POST /api/comments/:id/replies` |
| Compartilhar | Só o contador; "Sobre nós" promete a ação | `POST /api/posts/:id/shares` |
| Esqueci a senha | Link para a própria tela (Pendência 18) | `POST /api/auth/password/forgot` e `/reset`, além de envio de email |
| Editar perfil, bio e avatar | Não há tela; quem se cadastra fica sem bio e sem foto | `PATCH /api/me`, `PUT /api/me/avatar` |
| Editar ou excluir projeto | Não há tela | Nenhum por enquanto |

## 5. O que precisa existir além das rotas

### Banco

Versionado em `db/` e reproduzível a partir de um banco vazio. O `db/` não é carregado
automaticamente pelo container do MySQL, então falta decidir como aplicar os scripts.

| Tabela | Campos principais |
| --- | --- |
| `users` | `id`, `handle` (único), `name`, `email` (único), `password_hash`, `bio`, `avatar_url` |
| `posts` | `id`, `user_id`, `title`, `summary`, `description`, `code`, `image_path`, `shares`, `created_at` |
| `post_tags` | `post_id`, `name`, chave única `(post_id, name)` |
| `post_approvals` | `user_id`, `post_id`, chave primária composta |
| `comments` | `id`, `post_id`, `user_id`, `parent_id` (nulo no primeiro nível), `text`, `created_at` |
| `follows` | `follower_id`, `followed_id`, chave primária composta |
| `revoked_tokens` | `jti`, `expires_at` (ver D1) |

Com contagens reais, os números do seed (32 aprovações, 25 conexões) só se reproduzem criando
linhas fictícias. O seed SQL de desenvolvimento terá números menores ou precisará dessas linhas.

### Infraestrutura

- **Limite do nginx**: [nginx.conf](../frontend/nginx.conf) não define `client_max_body_size`, cujo
  padrão é 1 MB. Em produção, imagens entre 1 e 5 MB seriam recusadas com `413` antes de chegar à API.
- **Volume de imagens**: o Compose não tem volume para uploads. Precisa de um volume nomeado e de
  uma variável como `UPLOAD_DIR`, fora de `/app`, que é o bind mount do código.
- **Limite no Go**: aplicar `http.MaxBytesReader` no upload.
- **Novas variáveis**: declarar em `.env.example`, `docker-compose.yml` e `internal/config`.
- **Dependência**: `golang.org/x/crypto` (bcrypt) já é indireta e passaria a direta. Registrar em
  Complexity Tracking, junto com qualquer outra biblioteca.
- **Testes**: cada endpoint precisa de teste de unidade e de integração com casos de erro, com
  dados isolados no MySQL do Compose.

### Mudanças necessárias no frontend

A integração não fica restrita aos hooks.

- **Hooks síncronos**: `undefined` significa "não encontrado", sem distinguir de "carregando". As
  telas precisam de estados de carregamento e de erro, que não existem.
- **Ações síncronas**: `addComment` devolve `boolean` e `publishPost` devolve `string`. Viram
  `Promise`, o que afeta `CommentForm`, `PublishPage` e `useFormValidation`.
- **Erros do servidor**: `useFormValidation` não permite definir erros vindos da API.
- **Upload**: `ImageUpload` entrega só a URL da prévia; `PublishPage` precisa receber o `File`.
- **Identidade**: `navigation.ts` importa `VIEWER_HANDLE` direto, fora dos hooks, e `COMMENT_AUTHOR`
  (`@voce`) deixa de existir.
- **Login e logout**: Login, Cadastro e GitHub/Google só navegam; "Sair" é um link.
- **Acesso**: não há proteção de rotas nem o menu deslogado (Pendência 6 do `DESIGN.md`).
- **Seguir a si mesmo**: o botão aparece no próprio perfil e precisa ser ocultado.

## 6. Decisões

Todas aceitas. D1 foi alterada para JWT.

| # | Decisão | Definição |
| --- | --- | --- |
| D1 | Como manter a sessão | JWT HS256 em cookie `httpOnly` + `SameSite=Lax`. O logout grava o `jti` em `revoked_tokens` e invalida o token na hora. "Lembrar-me" define se o cookie é persistente e a validade do token |
| D2 | O que é público | Ler feed, projeto e perfil sem login, pois o design prevê menu deslogado com Feed. Escrita exige login |
| D3 | Onde filtrar o feed | No servidor, com `q`, `tags` e `sort`, para não trafegar a base inteira. A paginação pode ficar para depois: o `{ items }` já permite acrescentar `nextCursor` |
| D4 | O que são "Conexões" | Número de seguidores, que é o comportamento atual (+1 quando alguém segue). Confirmar com design |
| D5 | De onde vem o `@handle` | O cadastro não pede usuário. Gerar a partir do email, em minúsculas, com sufixo se já existir, ou incluir um campo novo no formulário (exige design) |
| D6 | `summary` e `code` | Publicar não coleta nenhum dos dois: `summary` copia `description` e `code` nunca é preenchido. Manter uma só descrição no banco e deixar `code` apenas para dados de exemplo |
| D7 | Regras de senha e limites de tamanho | O frontend só exige "preenchido". Definir tamanho mínimo de senha e máximos de título, descrição, tag e comentário, com as mensagens correspondentes |
| D8 | GitHub e Google nesta etapa | Fica para uma feature seguinte, pois exige apps OAuth, segredos e vínculo de contas. Até lá, os botões ficam ocultos |
| D9 | Onde guardar imagens | Volume local servido pela rota 10, que é o mais simples e cabe no Compose. Armazenamento externo só se o deploy exigir |

## 7. Ordem sugerida

O rate limit de login precisa existir antes de produção.

1. **Base**: schema, seed de desenvolvimento, helper de erro, banco de teste.
2. **Leitura**: rotas 5, 6, 11, 13 e 14, para ligar o feed, o detalhe e o perfil.
3. **Autenticação**: rotas 1 a 4 e o middleware de sessão.
4. **Escrita**: aprovar (8, 9), comentar (12), seguir (16, 17) e aprovados (15).
5. **Publicação**: rotas 7 e 10, com volume, limite do nginx e ajuste do `ImageUpload`.
6. **Itens da seção 4 e OAuth**, conforme forem confirmados.
