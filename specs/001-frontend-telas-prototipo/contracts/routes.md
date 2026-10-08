# Contrato de rotas (UI)

Endereços públicos da aplicação. São contrato com quem usa (links, favoritos, deep links) e com a
futura integração. Todas as rotas funcionam ao recarregar (fallback do nginx/Vite).

| Rota | Página (`src/pages`) | Layout | Item ativo no menu | Protótipo |
| --- | --- | --- | --- | --- |
| `/login` | `LoginPage` | `AuthLayout` | — | `Login(-mobile).dc.html` |
| `/cadastro` | `SignupPage` | `AuthLayout` | — | `Cadastro(-mobile).dc.html` |
| `/` | `FeedPage` | `AppLayout` | Feed | `Feed(-mobile).dc.html` |
| `/publicar` | `PublishPage` | `AppLayout` | — (botão "Publicar" do menu) | `Publicar(-mobile).dc.html` |
| `/projeto/:id` | `ProjectPage` | `AppLayout` | Feed | `Post(-mobile).dc.html` |
| `/perfil/:handle` | `ProfilePage` | `AppLayout` | Perfil (só quando `handle` = pessoa logada) | `Perfil(-mobile).dc.html` |
| `/sobre` | `AboutPage` | `AppLayout` | Sobre nós | `Sobre(-mobile).dc.html` |
| `*` | `NotFoundPage` | `AppLayout` | — | — (usa `EmptyState`) |

## Navegação (origem → destino)

| Origem | Controle | Destino |
| --- | --- | --- |
| Login | "Login" (após validar), "GitHub", "Google" | `/` |
| Login | "Crie seu cadastro!" | `/cadastro` |
| Login | "Esqueci a senha" | `/login` — permanece na própria tela até existir o fluxo de recuperação (FR-017) |
| Cadastro | "Cadastrar" (após validar), "GitHub", "Google" | `/` |
| Cadastro | "Faça seu login!" | `/login` |
| Menu | Publicar / Feed / Perfil / Sobre nós / Sair | `/publicar` / `/` / `/perfil/julio` / `/sobre` / `/login` |
| `PostCard` | mídia, título, ação de comentários | `/projeto/:id` |
| `PostCard`, `Comment` | autor (`UserBadge`) | `/perfil/:handle` |
| Publicar | "Publicar" (após validar) | `/projeto/<novo id>` |
| Publicar | "Descartar" | `/` |
| Detalhe | "Voltar ao feed" | `/` |
| Sobre nós | "Publicar um projeto" | `/publicar` |
| Não encontrado (projeto, perfil, rota) | "Voltar ao feed" | `/` |

## Estados "não encontrado"

- `/projeto/<id inexistente>` e `/perfil/<handle inexistente>` renderizam `EmptyState` dentro da
  própria página (o menu continua visível), com os títulos, textos e ação "Voltar ao feed"
  definidos em FR-029.
- Qualquer outra rota cai em `NotFoundPage`, que usa o mesmo `EmptyState`.
- O `<title>` do documento muda por página (`"Feed · CodeConnect"`, etc.) via `usePageTitle`.
