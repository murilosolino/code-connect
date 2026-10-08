# Contrato de componentes (UI)

Catálogo dos componentes reutilizáveis, com suas props públicas e onde cada um é usado. A regra
central: **cada padrão visual existe uma única vez**. Uma página nunca recria estilo de botão,
campo, tag, card, avatar ou menu; ela compõe os componentes abaixo. Medidas e estados vêm do
`DESIGN.md` e de `codeconnect-design/design-system/components/*.md`.

Camadas e direção de dependência (uma camada só importa das que estão à direita):

```text
pages/  →  features/  →  components/layout  →  components/ui  →  lib/
   └────────→ data/store (hooks) ←───────┘
```

- `components/ui`: primitivos sem conhecimento de domínio (recebem strings, números e callbacks).
- `components/layout`: estrutura de tela (menu, layout autenticado, tela de autenticação).
- `features/*`: componentes que conhecem os tipos de domínio (`PostView`, `Comment`, `User`).
- `pages/*`: só composição, leitura de hooks e estado local da tela.

## 1. Primitivos (`src/components/ui`)

| Componente | Props públicas | Notas de comportamento/a11y |
| --- | --- | --- |
| `Icon` | `name: IconName`, `size?: 'sm' \| 'md' \| 'lg'` (15/24/32px) | Sempre `aria-hidden`. `IconName` é união literal dos ícones usados. |
| `Action` *(interno)* | `to?` \| `href?` \| `onClick?`/`type?`, `children`, `className` | Base polimórfica: `to` → `Link`, `href` → `<a>`, senão `<button type="button">`. Usado por `Button`, `TextLink`, `NavItem`. |
| `Button` | `variant: 'primary' \| 'secondary' \| 'tertiary'`, `size?: 'md' \| 'lg'`, `icon?: IconName`, `iconPosition?: 'start' \| 'end'`, `fullWidth?`, `pressed?`, + props de `Action` | `lg` = 22px Regular (Publicar do menu). "Seguir" é um `Button tertiary` comum. Borda inset (`shadow-outline`) no secundário/terciário. `pressed` → `aria-pressed`. |
| `TextLink` | `variant?: 'default' \| 'form'`, `icon?`, + props de `Action` | `default`: `text-secondary`, hover `accent` sublinhado ("Limpar tudo", "Voltar ao feed"). `form`: `text-primary` sempre sublinhado ("Esqueci a senha", "Crie seu cadastro!"). Com `onClick` vira `<button>` (ação), com `to` vira link (navegação). |
| `TextField` | `label`, `type?: 'text' \| 'email' \| 'password' \| 'textarea'`, `error?`, `hideLabel?`, `ref`, + props nativas | `id` via `useId`; `<label htmlFor>`; `aria-invalid` + `aria-describedby` quando `error`; renderiza `FieldError`. Estado de erro = `shadow-field-error` (FR-026). |
| `FieldError` | `id`, `message?` | Ícone `error` 15px + texto 15px `offwhite`, em região `aria-live="polite"`. Reusado por `TextField` e `ImageUpload`. |
| `Checkbox` | `label`, `checked`, `onChange` | `<input type="checkbox">` real visualmente escondido + caixa desenhada; marcado = borda e `check` em `verde-destaque` (FR-027). |
| `SearchBox` | `value`, `onChange`, `label` | `<input type="search">` com `<label class="sr-only">`; placeholder "Digite o que você procura"; foco/hover = borda inset 1px. |
| `Tag` | `label`, `onRemove?` | Sem `onRemove` = prévia (`bg-cinza-claro`). Com `onRemove` = botão `close` com `aria-label="Remover <rótulo>"`. |
| `TagList` | `tags: string[]`, `onRemove?`, `label` | `<ul aria-label>` com `flex-wrap gap-2.5`; repassa `onRemove(tag)` a cada `Tag`. |
| `Tabs` | `items: {id, label}[]`, `value`, `onChange`, `label`, `panelId` (+ `tabId(panelId, id)` para o `aria-labelledby` do painel) | `role="tablist"`/`tab`, `aria-selected`, `aria-controls`, setas ←/→ movem e ativam (roving tabindex). |
| `Avatar` | `initials`, `src?`, `size: 'sm' \| 'profile'` | `sm` mostra só a primeira letra das iniciais (como nos protótipos); `profile` mostra todas e é responsivo 160px (< 640) / 208px (640–1023) / 254px (≥ 1024). Decorativo quando o nome está ao lado (`alt=""`). |
| `Logo` | — | Texto "CodeConnect" 26px/600 (FR-024) dentro de link para `/`. |
| `Surface` | `as?`, `padding?: 'md' \| 'lg' \| 'menu'`, `className?` | Superfície `bg-surface rounded-md`. Usado por menu, card do formulário de login, card do Sobre, corpo do `PostCard`. |
| `MediaPanel` | `rounded?: 'all' \| 'top'`, `padding?`, `children` | Área `bg-card-media`. Usado pelo topo do `PostCard`, banners de Login/Cadastro e Sobre, área de upload do Publicar. |
| `MediaPlaceholder` | `children?` | Espaço reservado do protótipo do Publicar: borda interna 1px `cinza-escuro` (`shadow-outline-dark`), `rounded-md`, ícone `code` 32px e texto `text-cinza-escuro`, centralizado, `gap-2`, padding 24. Sem `children` = só o ícone (card sem imagem). Usado por `ImageUpload` e `PostMedia`. |
| `CodeEditor` | `code`, `size: 'card' \| 'page' \| 'banner'`, `label` (nome acessível) ou `decorative` | Três pontos em `cinza`, `<pre>` Roboto Mono 15px/1.6 `cinza-claro`, `shadow-editor`. `decorative` (banners) → `aria-hidden`; nos cards `label="Trecho de código do projeto <título>"` → `role="img"`. |
| `EmptyState` | `icon: IconName`, `title`, `description?`, `action?: { label, to }` | FR-029: `Surface` padding 24, ícone 32px `text-secondary`, título 22px/600 `text-emphasis`, texto 15px `text-secondary`, ação `Button variant="secondary"`. Busca sem resultado, abas vazias do perfil, projeto/perfil/rota não encontrados. |

## 2. Layout (`src/components/layout`)

| Componente | Props | Uso |
| --- | --- | --- |
| `AppLayout` | — (rota pai com `<Outlet />`) | Todas as telas internas. Desktop (`lg+`, 1024px): `Sidebar` + conteúdo. Abaixo de `lg`: linha com `Logo` + `Button` "Publicar", depois `MobileNav`. Inclui o link "Pular para o conteúdo" (FR-030). |
| `Sidebar` | `items: NavEntry[]` | Menu lateral (`Surface padding="menu"`). |
| `MobileNav` | `items: NavEntry[]` | Barra horizontal abaixo de 1024px; rótulo 18px (< 640px) / 22px (640–1023px). |
| `NavItem` | `entry: NavEntry`, `layout: 'sidebar' \| 'bar'` | `NavLink` com ícone 32px sobre rótulo; normal/hover/focus/ativo; `aria-current="page"`. **Único** item de menu, usado pelos dois menus. |
| `navigation.ts` | `NAV_ITEMS: NavEntry[]`, `isActive(entry, pathname)` | Fonte única dos itens (Feed, Perfil, Sobre nós, Sair) e da regra "Detalhe ativa Feed". |
| `AuthScreen` | `banner: { code, text }`, `title`, `subtitle`, `children`, `footer` | Card de duas colunas a partir de `lg` (banner `MediaPanel` + `CodeEditor` / formulário em `Surface`), uma coluna abaixo disso. Compartilhado por Login e Cadastro. |
| `SocialLoginButtons` | `to` | "ou entre com outras contas" + botões GitHub e Google. Compartilhado por Login e Cadastro. |

## 3. Domínio (`src/features`)

| Componente | Props | Composto de | Uso |
| --- | --- | --- | --- |
| `posts/PostCard` | `post: PostView`, `size: 'feed' \| 'page'`, `headingLevel?` | `MediaPanel`, `PostMedia`, `Surface`, `TagList`, `PostActions`, `UserBadge` | Feed, Perfil (feed), Detalhe (page). |
| `posts/PostMedia` | `post`, `size`, `linkTo?` | `CodeEditor`, `<img>` ou `MediaPlaceholder` | Dentro do `PostCard`. |
| `posts/PostActions` | `approvals`, `shares`, `comments`, `approved`, `onApprove?`, `commentsTo?` | `Icon` | Aprovar (botão com `aria-pressed`; nome = "Aprovar" + contador), compartilhar (sempre estático: só o contador), comentários (link com `commentsTo`; senão estático). Área mínima 44px nos controles. |
| `posts/PostGrid` | `posts: PostView[]`, `label: string`, `empty: ReactNode` | `PostCard`, `grid-cards` | Feed e as duas abas do Perfil. |
| `posts/filterPosts.ts` | `filterPosts(posts, { query, tags, sort })` | — | Feed e busca do Perfil. |
| `feed/FeedFilters` | `tags`, `onRemove`, `onClear`, `onRestore` | `TagList`, `TextLink` | Só no Feed (filtros + "Limpar tudo"/"Nenhum filtro aplicado." + "Restaurar filtros"). |
| `users/UserBadge` | `handle`, `initials`, `size?: 'sm' \| 'lg'`, `linked?` | `Avatar` | Autor do card, autor de comentário/resposta, `@handle` do perfil. |
| `users/ProfileHeader` | `user: UserView`, `onToggleFollow` | `Avatar`, `Button`, `UserBadge` | Perfil. |
| `comments/CommentThread` | `comments: Comment[]` | `CommentLine`, `TextLink`/`Button` | Lista com "Ver/Ocultar respostas" (estado local; o primeiro com respostas começa aberto). |
| `comments/CommentLine` | `authorHandle`, `authorInitials`, `text`, `actions?` | `UserBadge` | **Mesmo componente** para comentário e resposta (resposta = recuo de 40px). |
| `comments/CommentForm` | `onSubmit(text): boolean` | `TextField`, `Button` | Detalhe; Enter ou "Comentar". |
| `publish/ImageUpload` | `file`, `onChange(file \| null)`, `error?` | `MediaPanel`, `MediaPlaceholder`/`<img>`, `Button`, `FieldError` | Publicar. Usa `useObjectUrl` e `validateImageFile`. |
| `publish/TagInput` | `tags`, `onChange(tags)` | `TextField`, `TagList` | Publicar; Enter adiciona sem duplicar, × remove. |

## 4. Hooks e utilitários compartilhados

| Módulo | API | Uso |
| --- | --- | --- |
| `hooks/useFormValidation` | `(schema) => { values, errors, setValue, register(name), handleSubmit(onValid) }` | Login, Cadastro, Publicar. Valida no submit, foca o primeiro inválido, limpa erro ao corrigir. |
| `hooks/usePageTitle` | `(title: string) => void` | Todas as páginas. |
| `hooks/useObjectUrl` | `(file \| null) => string \| undefined` | Prévia de imagem; revoga a URL anterior. |
| `lib/validation` | `required(msg)`, `email(msg)`, `loginSchema`, `signupSchema`, `projectSchema` | Regras e mensagens de FR-025 em um lugar só. |
| `lib/files` | `validateImageFile(file) => string \| null` | PNG/JPEG ≤ 5 MB. |
| `lib/text` | `normalizeText`, `pluralize(n, singular, plural)`, `formatHandle` | Busca/filtros, "1 Projeto/3 Projetos", `@handle`. |
| `lib/cx` | `cx(...classes)` | Junção de classes nas variantes. |

## 5. Matriz de reuso (componente × tela)

| Componente | Login | Cadastro | Feed | Publicar | Detalhe | Perfil | Sobre |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| `AppLayout` / `Sidebar` / `MobileNav` / `NavItem` | | | ✓ | ✓ | ✓ | ✓ | ✓ |
| `AuthScreen` / `SocialLoginButtons` | ✓ | ✓ | | | | | |
| `Button` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `TextField` / `FieldError` | ✓ | ✓ | | ✓ | ✓ | | |
| `Checkbox` | ✓ | ✓ | | | | | |
| `TextLink` | ✓ | ✓ | ✓ | | ✓ | | |
| `SearchBox` | | | ✓ | | | ✓ | |
| `Tag` / `TagList` | | | ✓ | ✓ | ✓ | ✓ | |
| `Tabs` | | | ✓ | | | ✓ | |
| `MediaPanel` / `CodeEditor` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `MediaPlaceholder` | | | ✓ | ✓ | ✓ | ✓ | |
| `Surface` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `PostCard` / `PostActions` / `UserBadge` | | | ✓ | | ✓ | ✓ | |
| `PostGrid` / `filterPosts` | | | ✓ | | | ✓ | |
| `EmptyState` | | | ✓ | | ✓ | ✓ | |
| `useFormValidation` | ✓ | ✓ | | ✓ | | | |
| `Avatar` | | | ✓ | | ✓ | ✓ | |
| `Icon` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
