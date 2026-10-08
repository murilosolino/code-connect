---

description: "Lista de tarefas — Telas do frontend a partir dos protótipos (sem backend)"
---

# Tasks: Telas do frontend a partir dos protótipos (sem backend)

**Input**: Design documents from `specs/001-frontend-telas-prototipo/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: OBRIGATÓRIOS. A constituição (Princípio IV) exige TDD: cada tarefa de teste vem antes da
implementação correspondente e DEVE ser executada e vista **falhando** (`make frontend-test`)
antes de a implementação começar.

**Organization**: tarefas agrupadas por user story. Tudo que é usado por mais de uma story
(primitivos, layout, store, `PostCard`, `filterPosts`, validação) está na Fase 2, para que cada
story dependa só da fundação e não de outra story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: user story da spec (US1…US6)

## Convenções para todas as tarefas

- Caminhos relativos à raiz do repositório; código em `frontend/src/`. Testes ficam **ao lado**
  do arquivo testado (`Button.tsx` → `Button.test.tsx`).
- Comandos rodam no container: `make frontend-test`, `make frontend-lint`. Dependências só via
  `make frontend-install pkg="…"`.
- Estilo: **apenas** tokens de `frontend/src/styles/theme.css` (nada de hex, `slate-*` ou valores
  arbitrários `[...]`). Medidas: `DESIGN.md` e `codeconnect-design/design-system/components/*.md`.
- Referência visual de cada tela: `codeconnect-design/telas/<Tela>.dc.html` (desktop) e
  `<Tela>-mobile.dc.html` (360px). Textos de UI copiados de lá, em pt-BR.
- Props públicas dos componentes: [contracts/components.md](./contracts/components.md). Rotas:
  [contracts/routes.md](./contracts/routes.md). Hooks de dados:
  [contracts/data-store.md](./contracts/data-store.md).
- Testes usam Testing Library com queries por papel/nome acessível (`getByRole`) e
  `@testing-library/user-event`; telas são renderizadas com `renderWithProviders` (T027).
- Commits em Conventional Commits (`feat(frontend): …`, `test(frontend): …`), com hooks ativos.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: branch, dependências, ferramenta de testes, fontes e tokens.

- [X] T001 Commitar os artefatos de spec/design pendentes na branch atual e criar a branch `feat/frontend-telas-prototipo` a partir dela (ou da `master` depois do merge de `docs/design-guidelines`); rodar `make hooks-install` (configura `.githooks`)
- [X] T002 Instalar o roteador: `make frontend-install pkg="react-router@^7"` (atualiza `frontend/package.json` e `frontend/package-lock.json`)
- [X] T003 Instalar as dependências de teste: `make frontend-install pkg="-D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom"` (atualiza `frontend/package.json` e `frontend/package-lock.json`)
- [X] T004 Configurar o Vitest em `frontend/vite.config.ts`: trocar o import de `defineConfig` para `vitest/config`, manter plugins/server atuais e adicionar `test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] }`; em `frontend/package.json` adicionar os scripts `"test": "vitest run"` e `"test:watch": "vitest"`
- [X] T005 Criar `frontend/src/test/setup.ts` importando `@testing-library/jest-dom/vitest` e registrando `afterEach(cleanup)` de `@testing-library/react`
- [X] T006 Adicionar ao `Makefile` o alvo `frontend-test: ## Testes do frontend (Vitest)` executando `$(DC) exec frontend npm test`, e incluí-lo na lista `.PHONY`
- [X] T007 [P] Atualizar `frontend/index.html`: `<title>CodeConnect</title>` e os `<link>` de preconnect + Google Fonts (`Prompt:wght@400;500;600`, `Roboto+Mono`, `Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,1,0&display=block`) exatamente como em `codeconnect-design/HANDOFF.md`, seção "Fontes e ícones"
- [X] T008 [P] Criar `frontend/src/styles/theme.css` copiando o bloco `@theme` de `codeconnect-design/tailwind-theme.css` e acrescentando os tokens da research R4: `--shadow-outline: inset 0 0 0 1px var(--color-cinza-medio)`, `--shadow-outline-accent: inset 0 0 0 1px var(--color-accent)`, `--shadow-outline-hover: inset 0 0 0 1px var(--color-accent-hover)`, `--shadow-field-error: inset 0 0 0 2px var(--color-branco)`, `--shadow-outline-dark: inset 0 0 0 1px var(--color-cinza-escuro)`, `--container-card-feed: 486px`, `--container-card-page: 993px`, `--spacing-textarea: 161px`; e os utilitários `@utility px-page { padding-inline: clamp(16px, 5vw, 80px) }` e `@utility grid-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 400px), 1fr)); gap: 24px }`; cada adição com comentário de origem
- [X] T009 Criar `frontend/src/styles/index.css` com `@import "tailwindcss";`, `@import "./theme.css";` e base: `body` com `bg-bg-page text-text-primary font-sans`, classe `.material-symbols-outlined` (font-family, `font-feature-settings: 'liga'`, `line-height: 1`, `user-select: none`); apagar `frontend/src/index.css` e trocar o import em `frontend/src/main.tsx` para `./styles/index.css`
- [X] T010 Validar o setup: `make frontend-lint` e `make frontend-test` executam sobre `frontend/` (o Vitest pode reportar "no test files"); registrar no PR que o ambiente foi recriado com `make build` após mudar `package.json`

**Checkpoint**: ferramentas prontas; nenhuma tela ainda.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: utilitários, dados, store, primitivos, layout, roteador e componentes de post
compartilhados por várias stories.

**⚠️ CRITICAL**: nenhuma story começa antes desta fase terminar.

### Utilitários puros (`frontend/src/lib`)

- [X] T011 [P] Escrever `frontend/src/lib/cx.test.ts`: `cx('a', false, undefined, 'b', null, '')` retorna `'a b'`
- [X] T012 [P] Escrever `frontend/src/lib/text.test.ts`: `normalizeText('Autenticação ')` → `'autenticacao'` (remove diacríticos via `normalize('NFD')`, minúsculas `pt-BR`, `trim`); `pluralize(1,'Projeto','Projetos')` → `'1 Projeto'` e `pluralize(3,…)` → `'3 Projetos'`; `formatHandle('julio')` → `'@julio'`
- [X] T013 [P] Escrever `frontend/src/lib/validation.test.ts`: `required('Msg')` devolve `'Msg'` para `''` e `'   '` e `null` para `'x'`; `email('Msg')` devolve `'Msg'` para `'ana'` e `'ana@'`, `null` para `'ana@ex.com'`; `validate(schema, values)` devolve só os campos com erro, usando a primeira regra que falhar de cada campo, na ordem de declaração do schema
- [X] T014 [P] Implementar `frontend/src/lib/cx.ts` (filtra valores falsy e junta com espaço)
- [X] T015 [P] Implementar `frontend/src/lib/text.ts` (`normalizeText`, `pluralize`, `formatHandle`)
- [X] T016 [P] Implementar `frontend/src/lib/validation.ts`: tipos `Rule = (value: string) => string | null` e `Schema<K extends string> = Record<K, Rule[]>`, regras `required(msg)` e `email(msg)` e a função `validate(schema, values)`; os schemas de cada formulário são adicionados nas stories (US3, US5)

### Dados e store (`frontend/src/data`)

- [X] T017 Criar `frontend/src/data/types.ts` com `User`, `Post`, `Comment`, `Reply`, `Viewer`, `AppState`, `PostView = Post & { author: User; commentCount: number; approvedByViewer: boolean }` e `UserView = User & { projectsCount: number; connectionsDisplayed: number; followedByViewer: boolean }`, com os campos e regras de [data-model.md](./data-model.md) ("`handle` … Único, minúsculo, sem `@`"; "`tags` … Sem vazias; sem duplicadas"; `avatarUrl?`, `bio?`, `code?`, `imageUrl?` opcionais)
- [X] T018 Criar `frontend/src/data/viewer.ts` exportando `VIEWER_HANDLE = 'julio'` e `COMMENT_AUTHOR = { handle: 'voce', initials: 'V' }`
- [X] T019 Escrever `frontend/src/data/seed.test.ts`: `createSeedState()` tem 8 posts na ordem `vendas`, `auth`, `landing`, `memoria`, `clima`, `tarefas`, `calendario`, `portfolio`; todo `authorHandle` existe em `users`; handles minúsculos e sem `@`; nenhuma tag vazia ou duplicada por post; comentários de primeiro nível por post: vendas 3, auth 7, landing 2, memoria 5, clima 2, tarefas 6, calendario 4, portfolio 1; `viewer.approvedPostIds` = `['auth', 'tarefas']`; `nextId` = 1
- [X] T020 Criar `frontend/src/data/seed.ts` (até T019 passar) exportando `createSeedState(): AppState` com: (a) os 6 posts de `postsData()` em `codeconnect-design/telas/Feed.dc.html` (ids `vendas`, `auth`, `landing`, `memoria`, `clima`, `tarefas`, nessa ordem) seguidos de `calendario` e `portfolio` de `data()` em `Perfil.dc.html`, mapeando `desc`→`summary`/`description`, `handle` sem `@`→`authorHandle`; `vendas.description` = texto longo do `Post.dc.html` ("Painel com gráficos interativos… exportado como imagem."), `vendas.code` = `code` do `Post.dc.html`; (b) usuários `julio` (name "Júlio Oliveira", initials "JO", bio do `Perfil.dc.html`, connections 25), `ana.souza`, `rafa.dev`, `bia`, `marcos`, `carol` (nome e inicial coerentes, connections fictícias); (c) comentários do `Post.dc.html` (c1–c3 com respostas) em `vendas` e comentários de exemplo curtos, em pt-BR, para que o número de comentários de primeiro nível seja auth 7, landing 2, memoria 5, clima 2, tarefas 6, calendario 4, portfolio 1; (d) `viewer = { handle: 'julio', approvedPostIds: ['auth', 'tarefas'], followingHandles: [] }`; (e) `nextId: 1`
- [X] T021 [P] Escrever `frontend/src/data/store/reducer.test.ts` cobrindo a tabela "Ações e transições" do data-model: `toggleApproval` alterna o id em `viewer.approvedPostIds` e soma ±1 em `approvals` (id inexistente: estado igual); `addComment` com `'  '` não muda o estado e com `' Oi '` acrescenta ao **fim** `{ authorHandle: 'voce', authorInitials: 'V', text: 'Oi', replies: [] }`; `toggleFollow` alterna em `followingHandles`; `publishPost` insere `novo-1` no **início** de `posts` com `summary = description`, `authorHandle: 'julio'`, `approvals: 0`, `shares: 0`, `comments['novo-1'] = []` e incrementa `nextId`; o estado anterior nunca é mutado
- [X] T022 [P] Escrever `frontend/src/data/store/selectors.test.ts`: `selectPostView` calcula `commentCount` (só primeiro nível), `approvedByViewer` e `author`; `selectUserView` calcula `projectsCount` (posts do autor), `connectionsDisplayed = connections + (seguindo ? 1 : 0)` e `followedByViewer`; `selectUserPosts('julio')` devolve `projects` (calendário, portfólio, vendas…) e `approved` (auth, tarefas); para outro handle `approved` é `[]`
- [X] T023 Implementar `frontend/src/data/store/reducer.ts` (`appReducer` puro + tipo `AppAction`) até T021 passar
- [X] T024 Implementar `frontend/src/data/store/selectors.ts` até T022 passar
- [X] T025 Escrever `frontend/src/data/store/hooks.test.tsx`: dentro de `AppDataProvider`, `useAppActions().toggleApproval('vendas')` reflete em `usePost('vendas')` e em `usePosts()`; `addComment` devolve `false` para texto vazio; `publishPost` devolve o novo id e `usePost(id)` o encontra; `usePost('x')` e `useUser('x')` devolvem `undefined`; nenhum hook chama `fetch` (espione `globalThis.fetch`)
- [X] T026 Implementar `frontend/src/data/store/AppDataProvider.tsx` (Context + `useReducer`, prop opcional `initialState` com padrão `createSeedState()`) e `frontend/src/data/store/hooks.ts` (`usePosts`, `usePost`, `useComments`, `useUser`, `useUserPosts`, `useViewer`, `useAppActions`) conforme [contracts/data-store.md](./contracts/data-store.md), até T025 passar
- [X] T027 Criar `frontend/src/test/renderWithProviders.tsx`: `renderWithProviders(ui, { route = '/', path = '*', routes?, initialState? })` monta `AppDataProvider` (com `initialState` opcional) e um `createMemoryRouter` com `initialEntries: [route]`; sem `routes`, usa uma rota única `{ path, element: ui }` (permite `path: '/projeto/:id'` para `useParams`); com `routes` (ex.: as `routes` de `frontend/src/app/router.tsx`), ignora `ui` e monta a árvore completa — usado nos testes que navegam entre telas; devolve `user = userEvent.setup()` e o `router` (para checar `router.state.location.pathname`)

### Hooks compartilhados (`frontend/src/hooks`)

- [X] T028 [P] Escrever `frontend/src/hooks/useFormValidation.test.tsx` com um formulário de teste de 2 campos obrigatórios: submit vazio não chama `onValid`, expõe os dois erros e move o foco para o **primeiro** campo inválido; digitar no campo com erro remove só o erro dele; campo só com espaços conta como vazio; submit válido chama `onValid(values)` com os valores digitados (sem `trim`, para não alterar senhas; `required` já ignora espaços e o reducer faz `trim` do título e da descrição)
- [X] T029 [P] Escrever `frontend/src/hooks/usePageTitle.test.tsx`: ao montar com `'Feed'` define `document.title` = `'Feed · CodeConnect'`; ao trocar o argumento, atualiza o título
- [X] T030 [P] Implementar `frontend/src/hooks/usePageTitle.ts`: define `document.title = "<título> · CodeConnect"` no efeito, até T029 passar
- [X] T031 Implementar `frontend/src/hooks/useFormValidation.ts` (`values`, `errors`, `setValue`, `register(name)` devolvendo `{ ref, name, value, onChange, error }`, `handleSubmit(onValid)`) usando `validate` de `lib/validation.ts`, até T028 passar

### Primitivos de UI (`frontend/src/components/ui`)

- [X] T032 [P] Escrever `frontend/src/components/ui/Button.test.tsx`: com `to` renderiza link com o `href` certo; sem `to` renderiza `<button type="button">` e chama `onClick`; `type="submit"` respeitado; `pressed` gera `aria-pressed`; o ícone fica `aria-hidden`
- [X] T033 [P] Escrever `frontend/src/components/ui/TextField.test.tsx`: o rótulo está associado ao campo (`getByLabelText`); `type="textarea"` renderiza `<textarea>`; com `error` o campo tem `aria-invalid="true"`, `aria-describedby` apontando para a mensagem visível e a mensagem fica numa região `aria-live="polite"`; sem `error` não há mensagem; `hideLabel` mantém o rótulo acessível
- [X] T034 [P] Escrever `frontend/src/components/ui/Tag.test.tsx` e `frontend/src/components/ui/TagList.test.tsx`: sem `onRemove` não há botão; com `onRemove` há um botão "Remover <rótulo>" que chama `onRemove`; `TagList` renderiza `<ul>` com `aria-label` e repassa `onRemove(tag)`
- [X] T035 [P] Escrever `frontend/src/components/ui/Tabs.test.tsx`: `role="tablist"` com `aria-label`; aba atual com `aria-selected="true"` e `tabIndex=0`, demais `-1`; clique chama `onChange(id)`; seta → e ← movem o foco e ativam a próxima/anterior (com volta circular)
- [X] T036 [P] Escrever `frontend/src/components/ui/SearchBox.test.tsx`: `<input type="search">` com rótulo acessível e placeholder "Digite o que você procura"; digitar chama `onChange` com o valor
- [X] T037 [P] Escrever `frontend/src/components/ui/CodeEditor.test.tsx`: o código aparece num `<pre>`; com `aria-label` o editor é exposto como `role="img"` com esse nome; com `decorative` fica `aria-hidden="true"` e sem nome
- [X] T038 [P] Escrever `frontend/src/components/ui/EmptyState.test.tsx`: título como heading (`headingLevel`, padrão 2), descrição visível, ícone `aria-hidden`; com `action` há link com o rótulo apontando para `action.to`; sem `action` não há link
- [X] T039 [P] Implementar `frontend/src/components/ui/Icon.tsx`: `IconName` como união literal (`search`, `close`, `feed`, `account_circle`, `info`, `logout`, `login`, `arrow_forward`, `arrow_back`, `upload`, `delete`, `code`, `share`, `chat`, `error`, `check`), `size: 'sm' | 'md' | 'lg'` (15/24/32px via tokens), sempre `aria-hidden="true"`
- [X] T040 Implementar `frontend/src/components/ui/Action.tsx`: base polimórfica (`to` → `Link` do `react-router`, `href` → `<a>`, senão `<button type={type ?? 'button'}>`), repassando `className`, `aria-*` e `ref`
- [X] T041 Implementar `frontend/src/components/ui/Button.tsx` sobre `Action` com mapa de variantes tipado (`satisfies Record<Variant, string>`): `primary` (`bg-accent text-on-accent`, hover `bg-accent-hover`), `secondary` (`shadow-outline-accent text-accent`, hover `shadow-outline-hover text-accent-hover`), `tertiary` (`shadow-outline text-text-secondary`, hover idem); tamanhos `md` (padding 12×16, 18px/600), `lg` (22px/400 — Publicar do menu); "Seguir" é um `tertiary` `md` comum (sem tamanho `compact`); `rounded-md`, `gap-2`, ícone 24px em `iconPosition` (padrão `end`); `fullWidth`; foco `outline-2 outline-focus-ring outline-offset-2`; até T032 passar
- [X] T042 [P] Implementar `frontend/src/components/ui/TextLink.tsx` sobre `Action`: `default` (`text-text-secondary`, hover `text-accent underline`) e `form` (`text-text-primary underline`), `icon` opcional à esquerda, foco padrão
- [X] T043 Implementar `frontend/src/components/ui/FieldError.tsx` (região `aria-live="polite"`; quando há `message`, linha com `Icon name="error" size="sm"` + texto 15px `text-offwhite`, `gap-2`, `mt-2`, `id` recebido) e `frontend/src/components/ui/TextField.tsx` (`useId`, label 18px `text-text-primary` 8px acima; campo `bg-field-bg text-on-field` 15px, `rounded-sm`, padding 8×16, placeholder `on-field`; textarea `h-textarea`; senha preenchida em `text-grafite`; erro → `shadow-field-error` + `aria-invalid` + `aria-describedby`; `ref` como prop), até T033 passar
- [X] T044 [P] Implementar `frontend/src/components/ui/Tag.tsx` (removível: `bg-field-bg text-on-field`, botão `close` 15px com `aria-label="Remover <rótulo>"`; prévia: `bg-cinza-claro`; padding 4×8, `rounded-sm`, 18px; 15px abaixo de `sm`) e `frontend/src/components/ui/TagList.tsx` (`<ul>` `flex flex-wrap gap-2.5`), até T034 passar
- [X] T045 [P] Implementar `frontend/src/components/ui/Tabs.tsx` (WAI-ARIA tabs com roving tabindex; 22px; 18px abaixo de `sm`; padding horizontal 4px, `gap-6`; ativa 600 `text-accent` sublinhada; inativa `text-text-secondary`, hover `text-cinza-claro`; `aria-controls={panelId}`), até T035 passar
- [X] T046 [P] Implementar `frontend/src/components/ui/SearchBox.tsx` (`bg-bg-surface rounded-sm`, padding 8×16, `gap-4`; ícone `search` 24px/15px texto no mobile e 32px/22px no desktop; ícone e placeholder `cinza-claro`; hover/focus-within `shadow-outline-accent`; `<label className="sr-only">`; tamanhos de desktop a partir de `lg`), até T036 passar
- [X] T047 [P] Implementar `frontend/src/components/ui/Avatar.tsx` (círculo `bg-cinza-medio text-cinza-escuro` com `initials` ou `<img alt="">`; `sm` = `size-avatar-sm`; `profile` = `size-avatar-profile-sm sm:size-avatar-profile-md lg:size-avatar-profile-lg` — 160 / 208 / 254px conforme `DESIGN.md` §5)
- [X] T048 [P] Implementar `frontend/src/components/ui/Logo.tsx` (link para `/` com "CodeConnect" 26px/600 `text-text-primary`, foco padrão)
- [X] T049 [P] Implementar `frontend/src/components/ui/Surface.tsx` (`bg-bg-surface rounded-md`; `padding: 'md' (16px) | 'lg' (24px) | 'menu' (40px × 16px)`; prop `as`) e `frontend/src/components/ui/MediaPanel.tsx` (`bg-bg-card-media`; `rounded: 'all' | 'top'`; padding por prop)
- [X] T050 [P] Implementar `frontend/src/components/ui/MediaPlaceholder.tsx` (espaço reservado do `Publicar.dc.html`: `rounded-md shadow-outline-dark text-cinza-escuro`, coluna centralizada, `gap-2`, padding 24, `Icon name="code" size="lg"` e `children` opcionais abaixo; sem `children` mostra só o ícone)
- [X] T051 [P] Implementar `frontend/src/components/ui/CodeEditor.tsx` (área `bg-bg-page rounded-md shadow-editor`, três pontos de 10px `bg-cinza`, `<pre>` `font-mono text-code text-cinza-claro` com overflow escondido; `size: 'card'` preenche a altura, `'page'` = `h-80` com padding 24, `'banner'`; aceita `aria-label` → `role="img"` com nome, ou `decorative` → `aria-hidden`), até T037 passar
- [X] T052 [P] Implementar `frontend/src/components/ui/EmptyState.tsx` conforme FR-029 (`Surface padding="lg"`, `Icon size="lg"` `text-text-secondary`, título Paragraph Large Semibold `text-text-emphasis` no nível `headingLevel`, descrição Paragraph Small `text-text-secondary`, ação opcional `Button variant="secondary"` com `to`), até T038 passar
- [X] T053 Criar `frontend/src/components/ui/index.ts` reexportando todos os primitivos (exceto `Action`, que é interno)

### Layout, rotas e app (`frontend/src/components/layout`, `frontend/src/app`)

- [ ] T054 [P] Escrever `frontend/src/components/layout/navigation.test.ts`: `NAV_ITEMS` tem, em ordem, Feed (`/`, `feed`), Perfil (`/perfil/julio`, `account_circle`), Sobre nós (`/sobre`, `info`), Sair (`/login`, `logout`); `isActive(feed, '/projeto/vendas')` é `true`; `isActive(perfil, '/perfil/julio')` é `true` e `isActive(perfil, '/perfil/ana.souza')` é `false`; Sair nunca fica ativo
- [ ] T055 Implementar `frontend/src/components/layout/navigation.ts` (`NavEntry`, `NAV_ITEMS` usando `VIEWER_HANDLE`, `isActive(entry, pathname)`), até T054 passar
- [ ] T056 Escrever `frontend/src/components/layout/AppLayout.test.tsx` (com `renderWithProviders` numa rota filha de teste): o primeiro Tab foca o link "Pular para o conteúdo", que aponta para `#conteudo`; existe `<main id="conteudo">` com o conteúdo da rota; a navegação tem `aria-label="Navegação principal"`; em `/projeto/vendas` o link "Feed" tem `aria-current="page"` e os demais não; o botão/link "Publicar" aponta para `/publicar`
- [ ] T057 Implementar `frontend/src/components/layout/NavItem.tsx` (`NavLink`/`Action` com ícone 32px acima do rótulo, `gap-2`, padding 8×16; normal `text-text-secondary`, hover `text-accent-hover`, focus-visible `text-branco` + anel, ativo `text-accent` + `aria-current="page"` via `isActive`; `layout: 'sidebar'` rótulo 22px, `'bar'` rótulo 18px abaixo de `sm` / 22px de `sm` até `lg`, `whitespace-nowrap`)
- [ ] T058 Implementar `frontend/src/components/layout/Sidebar.tsx` (`Surface padding="menu"` `w-60`, `Logo`, `gap-20` até a navegação; `Button variant="secondary" size="lg" fullWidth icon` → `/publicar`; lista de `NavItem layout="sidebar"` com `gap-10`) e `frontend/src/components/layout/MobileNav.tsx` (`Surface`, padding 24×16 mobile / 40×60 tablet, `NavItem layout="bar"` com `justify-between`), ambos consumindo `NAV_ITEMS`
- [ ] T059 Implementar `frontend/src/components/layout/AppLayout.tsx` (skip link como primeiro elemento: `sr-only` que, com `focus:not-sr-only`, aparece fixo no canto superior esquerdo com as classes do botão primário (FR-030); `bg-bg-page`, `px-page`, padding vertical 40px desktop / 24px mobile; container `max-w-7xl mx-auto`; `lg:flex gap-10` com `Sidebar` visível só a partir de `lg` (1024px, `DESIGN.md` §5); abaixo de `lg`, linha `Logo` + `Button` "Publicar" e depois `MobileNav`; `<main id="conteudo" tabIndex={-1}>` com `<Outlet />`; uma única `<nav aria-label="Navegação principal">` renderizada por breakpoint), até T056 passar
- [ ] T060 Escrever `frontend/src/app/router.test.tsx`: (deve falhar até T061/T062) renderizar `routes` de `frontend/src/app/router.tsx` em memória em `/qualquer-coisa` mostra "Página não encontrada", o texto "O endereço que você abriu não existe." e o link "Voltar ao feed"; com `globalThis.fetch` espionado, renderizar cada rota existente não faz nenhuma chamada (SC-006) — **as stories acrescentam suas rotas a este teste**
- [ ] T061 Implementar `frontend/src/pages/NotFoundPage.tsx` (`usePageTitle('Página não encontrada')`, `<h1 className="sr-only">`, `EmptyState icon="info"` "Página não encontrada" / "O endereço que você abriu não existe." com ação "Voltar ao feed" → `/`, conforme FR-029), até T060 passar
- [ ] T062 Criar `frontend/src/app/router.tsx` exportando `routes: RouteObject[]` (uma rota pai com `AppLayout` e filho `*` → `NotFoundPage`; as stories acrescentam suas rotas aqui) e `createAppRouter()` com `createBrowserRouter(routes)`; criar `frontend/src/app/App.tsx` com `AppDataProvider` + `RouterProvider`; atualizar `frontend/src/main.tsx` para importar `./app/App`; apagar `frontend/src/App.tsx` (chamada a `/api/health`, proibida por FR-002); até T060 passar

### Componentes de post compartilhados (`frontend/src/features`)

- [ ] T063 [P] Escrever `frontend/src/features/posts/filterPosts.test.ts`: `query` compara título e `summary` sem caixa/acentos (`'autenticacao'` encontra "API de autenticação em Node"); `tags` mantém posts com **ao menos uma** tag igual sem caixa/acentos e lista vazia mantém todos; `sort: 'populares'` ordena por `approvals` desc. com empate estável e `'recentes'` mantém a ordem recebida; os três critérios se combinam
- [ ] T064 [P] Escrever `frontend/src/features/posts/PostActions.test.tsx`: aprovar é botão com nome acessível "Aprovar" e `aria-pressed` refletindo `approved`, chama `onApprove`; contadores visíveis; com `commentsTo` o item de comentários é link para esse endereço e nome "Comentários (N)"; compartilhar exibe o contador sem navegar
- [ ] T065 [P] Escrever `frontend/src/features/posts/PostCard.test.tsx` (com `renderWithProviders`): `size="feed"` mostra título como link para `/projeto/<id>` num heading, a mídia também linka para o detalhe, tags em prévia (sem botão remover), autor `@handle` linkando para `/perfil/<handle>`; `size="page"` mostra `description` completa e o título sem link; com `imageUrl` renderiza `<img>` com `alt` "Imagem do projeto <título>"; sem `imageUrl` e sem `code` mostra o espaço reservado (ícone `code`) sem textos de instrução
- [ ] T066 [P] Escrever `frontend/src/features/posts/PostGrid.test.tsx` (com `renderWithProviders`): renderiza `<ul>` com um `<li>` por post (título de cada card visível) e, com lista vazia, renderiza só o conteúdo da prop `empty`
- [ ] T067 Implementar `frontend/src/features/posts/filterPosts.ts` (`filterPosts(posts, { query?, tags?, sort? })` usando `normalizeText`; ordenar com `toSorted`), até T063 passar
- [ ] T068 [P] Implementar `frontend/src/features/users/UserBadge.tsx` (`Avatar size="sm"` + `@handle` `paragraph-small` 600 `text-text-secondary`, `gap-2`; `linked` (padrão) → link para `/perfil/<handle>`; `size="lg"` = handle 22px sem avatar; `break-words` para handles longos)
- [ ] T069 [P] Implementar `frontend/src/features/posts/PostActions.tsx` (botões/links com `Icon` 24px acima do número 15px, `text-text-secondary`, hover `text-accent-hover`, aprovado `text-accent`, área mínima 44×44px, `gap-4`), até T064 passar
- [ ] T070 Implementar `frontend/src/features/posts/PostMedia.tsx` (dentro de `MediaPanel rounded="top"`: `<img>` se `imageUrl`, senão `CodeEditor` com `code`, senão `MediaPlaceholder` sem textos; feed: padding 24 e `h-60`; página: padding 16×24 e editor `h-80`; `linkTo` envolve em link com nome acessível "Abrir projeto <título>")
- [ ] T071 Implementar `frontend/src/features/posts/PostCard.tsx` (`PostMedia` + corpo `Surface` com padding 16 e `gap-4`: título `text-text-emphasis` 18px/600 no feed ou 22px/600 na página, hover do link `text-accent-hover`; descrição 15px; `TagList` prévia; rodapé `justify-between` com `PostActions` e `UserBadge`; largura `max-w-card-feed` / `max-w-card-page`; título e descrição com `break-words` (textos longos não estouram em 360px); `headingLevel` configurável; aprovar chama `useAppActions().toggleApproval`), até T065 passar
- [ ] T072 Implementar `frontend/src/features/posts/PostGrid.tsx` (`<ul className="grid-cards">` de `PostCard size="feed"`; quando `posts` vazio renderiza a prop `empty`), até T066 passar

**Checkpoint**: fundação pronta; `make frontend-test` e `make frontend-lint` verdes. As stories podem começar.

---

## Phase 3: User Story 1 — Navegar pelo feed e encontrar projetos (Priority: P1) 🎯 MVP

**Goal**: feed com cards, busca, filtros por tag, abas Recentes/Populares e navegação pelo menu.

**Independent Test**: abrir `/` em 1440px e 360px; verificar lista, busca, filtros, abas e menu
(quickstart, roteiro 1 e 2).

### Tests for User Story 1 ⚠️

- [ ] T073 [P] [US1] Escrever `frontend/src/features/feed/FeedFilters.test.tsx`: com tags, lista removível e botão "Limpar tudo" (ação, não link) chamando `onClear`; remover chama `onRemove(tag)`; sem tags mostra "Nenhum filtro aplicado." e o botão "Restaurar filtros" chamando `onRestore`
- [ ] T074 [P] [US1] Escrever `frontend/src/pages/FeedPage.test.tsx` cobrindo os cenários US1-1 a US1-7 da spec: abre com aba "Recentes" selecionada, filtros "Front-end", "React", "Acessibilidade" e só os cards com essas tags na ordem original; "Populares" reordena por aprovações; remover filtro recalcula a lista; "Limpar tudo" → "Nenhum filtro aplicado." → "Restaurar filtros" devolve os 3; busca "autenticacao" (após limpar filtros) mostra só "API de autenticação em Node"; busca sem resultado mostra o estado vazio "Nenhum projeto encontrado" / "Tente outra busca ou remova alguns filtros." sem botão; clicar no título navega para `/projeto/<id>` e no autor para `/perfil/<handle>`; `document.title` = "Feed · CodeConnect"

### Implementation for User Story 1

- [ ] T075 [US1] Implementar `frontend/src/features/feed/FeedFilters.tsx` (`TagList` removível com `aria-label="Filtros aplicados"` e `TextLink` "Limpar tudo"; estado vazio com texto e `TextLink` "Restaurar filtros"; layout do `Feed.dc.html`), até T073 passar
- [ ] T076 [US1] Implementar `frontend/src/pages/FeedPage.tsx` (estado local: `query`, `tags` iniciais `['Front-end','React','Acessibilidade']`, `tab: 'recentes' | 'populares'`; `usePosts()` + `filterPosts` em `useMemo`; `SearchBox` no topo, `FeedFilters`, `Tabs label="Ordenar projetos"` controlando `PostGrid` dentro de `role="tabpanel"`; `<h1 className="sr-only">Feed</h1>`; `EmptyState icon="search"` "Nenhum projeto encontrado" / "Tente outra busca ou remova alguns filtros." sem ação (FR-029); `usePageTitle('Feed')`), até T074 passar
- [ ] T077 [US1] Registrar a rota índice `/` → `FeedPage` dentro do `AppLayout` em `frontend/src/app/router.tsx` e acrescentar `/` ao teste sem `fetch` de `frontend/src/app/router.test.tsx`
- [ ] T078 [US1] Validar US1 manualmente em 360, 768, 1024 e 1440px contra `Feed.dc.html` / `Feed-mobile.dc.html` (grid com 2 colunas em 1440px e 1 coluna em 1024px, 768px e 360px — FR-009; sem rolagem horizontal, foco visível, menu lateral a partir de 1024px e barra abaixo); anotar diferenças intencionais no PR

**Checkpoint**: US1 funcional e testável sozinha — é o MVP.

---

## Phase 4: User Story 2 — Ver o detalhe de um projeto e interagir (Priority: P1)

**Goal**: detalhe com card em versão página, aprovar, comentários com respostas e novo comentário.

**Independent Test**: abrir `/projeto/vendas` e verificar aprovação, respostas e novo comentário
(quickstart, roteiro 3).

### Tests for User Story 2 ⚠️

- [ ] T079 [P] [US2] Escrever `frontend/src/features/comments/CommentThread.test.tsx`: renderiza autor, inicial e texto de cada comentário; o **primeiro** comentário com respostas começa com respostas visíveis e botão "Ocultar respostas"; os demais com respostas mostram "Ver respostas" (com `aria-expanded="false"` e `aria-controls`) e alternam ao clicar; comentário sem respostas não mostra o botão; "Responder" é exibido
- [ ] T080 [P] [US2] Escrever `frontend/src/features/comments/CommentForm.test.tsx`: campo com rótulo acessível "Seu comentário"; Enter ou botão "Comentar" chama `onSubmit(texto)`; limpa o campo quando `onSubmit` devolve `true`; com campo vazio/espaços não chama `onSubmit`
- [ ] T081 [P] [US2] Escrever `frontend/src/pages/ProjectPage.test.tsx` cobrindo US2-1 a US2-5: aprovar soma 1 (32 → 33) e `aria-pressed="true"`, de novo volta; comentar adiciona `@voce` ao fim e o contador vai de 3 para 4; com `routes` do app, voltar ao feed (`/`) mostra o card de vendas com 4 comentários e aprovado (estado compartilhado); "Voltar ao feed" navega para `/`; o item "Feed" do menu tem `aria-current="page"`; `/projeto/inexistente` mostra "Projeto não encontrado" / "Confira o endereço ou volte ao feed para ver outros projetos." com "Voltar ao feed"

### Implementation for User Story 2

- [ ] T082 [P] [US2] Implementar `frontend/src/features/comments/CommentLine.tsx` (`UserBadge` com avatar 32px + `@handle` 15px/600 + texto 15px, cor `text-cinza-escuro`, `gap-2`; slot `actions`) — usado para comentário **e** resposta
- [ ] T083 [US2] Implementar `frontend/src/features/comments/CommentThread.tsx` (bloco `bg-offwhite text-cinza-escuro rounded-md`, padding 24 desktop / 16 mobile; estado local de abertos começando pelo primeiro com respostas; "Responder" 15px/600 sem ação; botão "Ver respostas"/"Ocultar respostas" 12.5px com traço de 32px antes, `aria-expanded`; respostas recuadas 40px usando `CommentLine`), até T079 passar
- [ ] T084 [US2] Implementar `frontend/src/features/comments/CommentForm.tsx` (`<form>` com `TextField label="Seu comentário"` e `Button variant="primary" type="submit" icon="arrow_forward"` "Comentar"; Enter submete; vazio não submete), até T080 passar
- [ ] T085 [US2] Implementar `frontend/src/pages/ProjectPage.tsx` (`useParams().id`, `usePost`, `useComments`, `useAppActions().addComment`; `TextLink icon="arrow_back"` "Voltar ao feed"; `PostCard size="page" headingLevel={1}`; seção "Comentários" com `h2`, `CommentForm` e `CommentThread`; não encontrado → `EmptyState icon="info"` "Projeto não encontrado" / "Confira o endereço ou volte ao feed para ver outros projetos." com ação "Voltar ao feed" (FR-029); `usePageTitle(post.title)`), até T081 passar
- [ ] T086 [US2] Registrar `/projeto/:id` → `ProjectPage` em `frontend/src/app/router.tsx` e acrescentar `/projeto/vendas` ao teste sem `fetch` em `frontend/src/app/router.test.tsx`
- [ ] T087 [US2] Validar US2 manualmente em 360 e 1440px contra `Post.dc.html` / `Post-mobile.dc.html` e só com teclado

**Checkpoint**: US1 e US2 funcionam de forma independente.

---

## Phase 5: User Story 3 — Publicar um novo projeto (Priority: P2)

**Goal**: formulário de novo projeto com imagem, tags, validação, publicar e descartar.

**Independent Test**: preencher `/publicar`, adicionar/remover tags, carregar imagem e publicar,
chegando ao detalhe do novo projeto (quickstart, roteiro 4).

### Tests for User Story 3 ⚠️

- [ ] T088 [P] [US3] Escrever `frontend/src/lib/files.test.ts`: `validateImageFile` aceita `image/png` e `image/jpeg` de até 5 MB (`5 * 1024 * 1024` bytes, inclusive), devolve "Escolha uma imagem PNG ou JPG." para outro tipo e "Escolha uma imagem de até 5 MB." acima do limite
- [ ] T089 [P] [US3] Escrever `frontend/src/hooks/useObjectUrl.test.tsx`: com `URL.createObjectURL`/`revokeObjectURL` mockados, devolve a URL do arquivo, revoga a anterior ao trocar de arquivo e ao receber `null`, e **não** revoga ao desmontar quando `keepOnUnmount` é `true`
- [ ] T090 [P] [US3] Acrescentar a `frontend/src/lib/validation.test.ts` os casos de `projectSchema`: `title` vazio → "Informe o nome do projeto."; `description` vazio → "Informe a descrição do projeto."; ambos com só espaços contam como vazios
- [ ] T091 [P] [US3] Escrever `frontend/src/features/publish/TagInput.test.tsx`: campo "Tags"; Enter adiciona a tag (após `trim`) e limpa o campo; Enter com vazio ou com tag repetida (sem caixa/acentos) não adiciona e limpa o campo; o botão "Remover <tag>" remove; Enter **não** submete o formulário pai
- [ ] T092 [P] [US3] Escrever `frontend/src/features/publish/ImageUpload.test.tsx`: estado inicial mostra "Carregue uma imagem do seu código", "PNG ou JPG, até 5 MB" e o botão "Carregar imagem"; escolher PNG válido (via `user.upload` no input de arquivo) mostra a prévia `<img>` e o botão vira "Trocar imagem"; PDF ou arquivo > 5 MB mostra a mensagem de erro (FieldError) e não troca a prévia
- [ ] T093 [P] [US3] Escrever `frontend/src/pages/PublishPage.test.tsx` cobrindo US3-1 a US3-7 e FR-025: título "Novo projeto"; tags iniciais vazias; "Publicar" com campos vazios mostra "Informe o nome do projeto." e "Informe a descrição do projeto.", foca "Nome do projeto" e não navega; preenchido, "Publicar" navega para `/projeto/novo-1` (verificar `router.state.location.pathname`) e `usePosts()` passa a ter `novo-1` como primeiro item, com título, descrição, tags informados e autor `@julio` (FR-014); "Descartar" navega para `/` sem criar projeto; no DOM (e, portanto, na ordem de Tab e do leitor de tela) o botão "Publicar" vem antes de "Descartar"

### Implementation for User Story 3

- [ ] T094 [P] [US3] Implementar `frontend/src/lib/files.ts` (`MAX_IMAGE_BYTES = 5 * 1024 * 1024`, `ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg']`, `validateImageFile(file): string | null`), até T088 passar
- [ ] T095 [P] [US3] Implementar `frontend/src/hooks/useObjectUrl.ts` (`(file: File | null, options?: { keepOnUnmount?: boolean }) => string | undefined`), até T089 passar
- [ ] T096 [P] [US3] Adicionar `projectSchema` (`title: [required('Informe o nome do projeto.')]`, `description: [required('Informe a descrição do projeto.')]`) a `frontend/src/lib/validation.ts`, até T090 passar
- [ ] T097 [US3] Implementar `frontend/src/features/publish/TagInput.tsx` (`TextField label="Tags"` + `TagList` removível; `onKeyDown` Enter com `preventDefault`; deduplicação com `normalizeText`), até T091 passar
- [ ] T098 [US3] Implementar `frontend/src/features/publish/ImageUpload.tsx` (`MediaPanel` com `MediaPlaceholder` contendo "Carregue uma imagem do seu código" (18px/600) e "PNG ou JPG, até 5 MB" ou `<img alt="Prévia da imagem do projeto">`; `<input type="file" accept="image/png,image/jpeg" className="sr-only">` acionado pelo `Button variant="tertiary" icon="upload"` "Carregar imagem"/"Trocar imagem"; `validateImageFile` + `FieldError`; `useObjectUrl` com `keepOnUnmount`), até T092 passar
- [ ] T099 [US3] Implementar `frontend/src/pages/PublishPage.tsx` (layout de duas colunas a partir de `lg` e uma abaixo, como em `Publicar.dc.html`; `<h1>` "Novo projeto"; `ImageUpload`; `useFormValidation(projectSchema)` para "Nome do projeto" e "Descrição" (`type="textarea"`); `TagInput`; ações `Button primary icon="arrow_forward"` "Publicar" (submit) e `Button tertiary icon="delete"` "Descartar" → `/`, nessa ordem no DOM, em `flex-col` abaixo de `lg` e `lg:flex-row-reverse` a partir de `lg` (Descartar à esquerda, como no protótipo desktop; sem `order-*` em itens isolados; registrar no PR que no desktop a ordem de Tab difere da visual); ao publicar chama `publishPost({ title, description, tags, imageUrl })` e navega para `/projeto/<id>`; `usePageTitle('Novo projeto')`), até T093 passar
- [ ] T100 [US3] Registrar `/publicar` → `PublishPage` em `frontend/src/app/router.tsx` e acrescentá-la ao teste sem `fetch` em `frontend/src/app/router.test.tsx`
- [ ] T101 [US3] Validar US3 manualmente em 360 e 1440px contra `Publicar.dc.html` / `Publicar-mobile.dc.html` (inclusive estado de erro de FR-026 e ordem dos botões no mobile); no feed, um projeto publicado com a tag "React" aparece primeiro em "Recentes" e um sem as tags dos filtros iniciais aparece primeiro depois de "Limpar tudo" (FR-014)

**Checkpoint**: publicar funciona e o resultado aparece no feed e no detalhe.

---

## Phase 6: User Story 4 — Ver um perfil (Priority: P2)

**Goal**: perfil com cabeçalho, seguir/seguindo e abas Projetos/Aprovados.

**Independent Test**: abrir `/perfil/julio`, seguir/deixar de seguir e trocar de aba (quickstart,
roteiro 5).

### Tests for User Story 4 ⚠️

- [ ] T102 [P] [US4] Escrever `frontend/src/features/users/ProfileHeader.test.tsx`: mostra `@julio`, "Júlio Oliveira" em heading, bio, "3 Projetos" e "25 Conexões"; botão "Seguir" com `aria-pressed="false"` chama `onToggleFollow`; com `followedByViewer` mostra "Seguindo", `aria-pressed="true"` e "26 Conexões"; usuário sem `bio` não renderiza parágrafo vazio; "1 Projeto" no singular
- [ ] T103 [P] [US4] Escrever `frontend/src/pages/ProfilePage.test.tsx` cobrindo US4-1 a US4-3: "Seguir" ↔ "Seguindo" e 25 ↔ 26 conexões; aba "Projetos" lista os 3 projetos de Júlio e "Aprovados" lista "API de autenticação em Node" e "Lista de tarefas com Next.js e Prisma"; a busca filtra a aba ativa por título/descrição; em `/perfil/julio` o item "Perfil" do menu tem `aria-current="page"`; `/perfil/ninguem` mostra "Perfil não encontrado" / "Confira o endereço ou volte ao feed para conhecer outras pessoas." com "Voltar ao feed"; `/perfil/ana.souza` mostra o perfil dela com seus projetos e a aba "Aprovados" mostra "Nenhum projeto aprovado ainda." (US4-3 a US4-5)

### Implementation for User Story 4

- [ ] T104 [US4] Implementar `frontend/src/features/users/ProfileHeader.tsx` (`Avatar size="profile"`; lado a lado no desktop e empilhado/centralizado abaixo de `lg`, `gap-6`; `UserBadge size="lg" linked={false}` + `Button variant="tertiary" pressed` "Seguir"/"Seguindo"; nome 26px/600 `text-accent` como `<h1>`; bio 18px `text-text-secondary`; estatísticas com `pluralize`, número 600, `gap-6`; divisor 1px `bg-divider`), até T102 passar
- [ ] T105 [US4] Implementar `frontend/src/pages/ProfilePage.tsx` (`useParams().handle`, `useUser`, `useUserPosts`, `useAppActions().toggleFollow`; `SearchBox` só a partir de `lg` (`hidden lg:flex`, conforme protótipo e US4-4) filtrando com `filterPosts`; `Tabs label="Projetos do perfil"` Projetos/Aprovados controlando `PostGrid` em `role="tabpanel"`; abas vazias → `EmptyState icon="code"` "Nenhum projeto publicado ainda." / "Nenhum projeto aprovado ainda."; não encontrado → `EmptyState icon="info"` "Perfil não encontrado" / "Confira o endereço ou volte ao feed para conhecer outras pessoas." com "Voltar ao feed" (FR-029); `usePageTitle(user.name)`), até T103 passar
- [ ] T106 [US4] Registrar `/perfil/:handle` → `ProfilePage` em `frontend/src/app/router.tsx` e acrescentar `/perfil/julio` ao teste sem `fetch` em `frontend/src/app/router.test.tsx`
- [ ] T107 [US4] Validar US4 manualmente em 360, 768 (avatar 208px) e 1440px contra `Perfil.dc.html` / `Perfil-mobile.dc.html`

**Checkpoint**: perfil funcional e ligado aos autores dos cards.

---

## Phase 7: User Story 5 — Entrar e criar conta (visual) (Priority: P3)

**Goal**: Login e Cadastro com validação (FR-025/FR-026), checkbox (FR-027) e navegação para o feed.

**Independent Test**: abrir `/login` e `/cadastro` em 1440px e 360px, validar, alternar e entrar
(quickstart, roteiro 6).

### Tests for User Story 5 ⚠️

- [ ] T108 [P] [US5] Escrever `frontend/src/components/ui/Checkbox.test.tsx`: `<input type="checkbox">` real com rótulo "Lembrar-me" associado; clique e tecla Espaço alternam `checked` via `onChange`; o ícone `check` só aparece marcado e é `aria-hidden`
- [ ] T109 [P] [US5] Acrescentar a `frontend/src/lib/validation.test.ts` os casos de `loginSchema` (`identifier` vazio → "Informe seu email ou usuário."; `password` vazio → "Informe sua senha.") e `signupSchema` (`name` → "Informe seu nome."; `email` vazio → "Informe seu email.", `'ana@'` → "Digite um email válido."; `password` → "Informe sua senha.")
- [ ] T110 [P] [US5] Escrever `frontend/src/pages/LoginPage.test.tsx` cobrindo US5-1, US5-2, US5-4 a US5-6: heading "Login" e "Boas-vindas! Faça seu login."; campos "Email ou usuário" e "Senha"; "Login" com campos vazios mostra as duas mensagens, foca "Email ou usuário" e não navega; corrigir um campo remove o erro dele; preenchido, "Login" navega para `/`; "GitHub" e "Google" navegam para `/` sem validar; "Crie seu cadastro!" leva a `/cadastro`; "Esqueci a senha" é exibido como link; "Lembrar-me" alterna; não há menu de navegação
- [ ] T111 [P] [US5] Escrever `frontend/src/pages/SignupPage.test.tsx` cobrindo US5-2 a US5-5: heading "Cadastro" e "Olá! Preencha seus dados."; campos "Nome", "Email", "Senha"; envio vazio mostra as três mensagens e foca "Nome"; email `ana@` mostra "Digite um email válido."; preenchido, "Cadastrar" navega para `/`; GitHub/Google navegam para `/`; "Faça seu login!" leva a `/login`

### Implementation for User Story 5

- [ ] T112 [P] [US5] Implementar `frontend/src/components/ui/Checkbox.tsx` (input nativo `sr-only` + caixa `24×24` `rounded-sm` com borda 2px `border-border-inactive`; marcado: borda `border-accent` e `Icon name="check"` em `text-accent`; foco visível na caixa via `peer-focus-visible`; rótulo 15px `text-offwhite`, como no protótipo de Login) e exportá-lo em `frontend/src/components/ui/index.ts`, até T108 passar
- [ ] T113 [P] [US5] Adicionar `loginSchema` e `signupSchema` a `frontend/src/lib/validation.ts` com as mensagens de FR-025, até T109 passar
- [ ] T114 [US5] Implementar `frontend/src/components/layout/AuthScreen.tsx` (página `bg-bg-page px-page` centralizada; card de duas colunas a partir de `lg`: banner `MediaPanel` com `CodeEditor decorative` + frase, e formulário em `Surface`; uma coluna com banner reduzido abaixo de `lg`; `<main>` com `<h1>` = `title` e `subtitle`; slot `footer`) e `frontend/src/components/layout/SocialLoginButtons.tsx` ("ou entre com outras contas" + `Button variant="tertiary"` "GitHub" e "Google" com `to`), conforme `Login.dc.html` / `Cadastro.dc.html`
- [ ] T115 [US5] Implementar `frontend/src/pages/LoginPage.tsx` (`AuthScreen` com banner do `Login.dc.html`; `<form noValidate>` com `useFormValidation(loginSchema)`; `TextField` "Email ou usuário" e `type="password"` "Senha"; `Checkbox` "Lembrar-me" em estado local + `TextLink variant="form" to="/login"` "Esqueci a senha" (FR-017: link real que permanece na própria tela até existir o fluxo de recuperação; comentar no código); `Button primary type="submit" icon="arrow_forward"` "Login" → `navigate('/')`; `SocialLoginButtons to="/"`; rodapé "Ainda não tem conta? " + `TextLink variant="form" to="/cadastro"` "Crie seu cadastro!"; `usePageTitle('Login')`), até T110 passar
- [ ] T116 [US5] Implementar `frontend/src/pages/SignupPage.tsx` (mesma composição de `LoginPage` com banner do `Cadastro.dc.html`, `signupSchema`, campos "Nome", "Email" (`type="email"`), "Senha", `Checkbox` "Lembrar-me", botão "Cadastrar", rodapé "Já tem conta? " + "Faça seu login!" → `/login`; `usePageTitle('Cadastro')`), até T111 passar
- [ ] T117 [US5] Registrar `/login` → `LoginPage` e `/cadastro` → `SignupPage` em `frontend/src/app/router.tsx` **fora** do `AppLayout` e acrescentá-las ao teste sem `fetch` em `frontend/src/app/router.test.tsx`
- [ ] T118 [US5] Validar US5 manualmente em 360 e 1440px contra `codeconnect-design/telas/Login(-mobile).dc.html` e `codeconnect-design/telas/Cadastro(-mobile).dc.html`, incluindo estado de erro (FR-026) e checkbox marcado (FR-027)

**Checkpoint**: fluxo visual de entrada completo.

---

## Phase 8: User Story 6 — Conhecer o CodeConnect (Priority: P3)

**Goal**: tela Sobre nós estática com convite para publicar.

**Independent Test**: abrir `/sobre` e conferir conteúdo e o botão "Publicar um projeto"
(quickstart, roteiro 7).

### Tests for User Story 6 ⚠️

- [ ] T119 [P] [US6] Escrever `frontend/src/pages/AboutPage.test.tsx`: `<h1>` "Código em primeiro plano" e o subtítulo; headings "Sobre nós", "Nossa missão", "Como funciona", "Para quem é"; lista "Como funciona" com 3 itens; "Publicar um projeto" é link para `/publicar`; o item "Sobre nós" do menu tem `aria-current="page"`

### Implementation for User Story 6

- [ ] T120 [US6] Implementar `frontend/src/pages/AboutPage.tsx` (banner `MediaPanel` com título, subtítulo e `CodeEditor decorative` do `Sobre.dc.html`; `Surface` com as quatro seções e textos do protótipo; "Como funciona" como `<ul>` com `Icon` `upload`/`code`/`chat`; `Button primary to="/publicar" icon="arrow_forward"` "Publicar um projeto"; `usePageTitle('Sobre nós')`), até T119 passar
- [ ] T121 [US6] Registrar `/sobre` → `AboutPage` em `frontend/src/app/router.tsx` e acrescentá-la ao teste sem `fetch` em `frontend/src/app/router.test.tsx`
- [ ] T122 [US6] Validar US6 manualmente em 360 e 1440px contra `Sobre.dc.html` / `Sobre-mobile.dc.html`

**Checkpoint**: todas as stories funcionais.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: revisão transversal, documentação e gates de merge.

- [ ] T123 [P] Atualizar `DESIGN.md`: §7 com os tokens semânticos e os utilitários adotados (`frontend/src/styles/theme.css`, inclusive `shadow-outline-dark` do `MediaPlaceholder`); Pendência 5 com o fundo de página `grafite #00090E` usado; novas pendências "Busca do Perfil só no desktop no protótipo", "Feed filtra pelos filtros iniciais (o protótipo não filtrava)" "Cards já aprovados pela pessoa logada no feed" e "Ordem dos botões do Publicar: no desktop a ordem visual é Descartar → Publicar, mas o foco segue Publicar → Descartar (ordem do mobile)"; conferir que as Pendências 7 a 11 (erro de campo, checkbox, estados vazios, skip link, ponto de quebra do menu) batem com o implementado
- [ ] T124 [P] Atualizar `CLAUDE.md`: trocar "there is no ESLint and no frontend test runner yet" por `make frontend-test` (Vitest + Testing Library), descrever a organização `frontend/src` (`app`, `styles`, `data/store`, `components/ui`, `components/layout`, `features`, `pages`) e registrar que `setup_tasks.py` precisa de `PYTHONIOENCODING=utf-8` no Windows
- [ ] T125 Revisão de reuso: procurar em `frontend/src/pages` e `frontend/src/features` classes de cor/tipografia repetidas ou marcação duplicada de botão/campo/tag/card; promover para componente o que aparecer em 2 lugares; confirmar que `components/ui` não importa de `features`, `data` nem `pages`
- [ ] T126 Auditoria de tokens: buscar em `frontend/src` por `#`-hex, `slate-`, `gray-` e classes arbitrárias com `[`; nenhuma ocorrência fora de `frontend/src/styles/theme.css`
- [ ] T127 Auditoria de acessibilidade em todas as telas (`frontend/src/pages/*.tsx`): navegação só por teclado (ordem lógica, foco visível em todos os controles), um `<h1>` por página, nomes acessíveis de botões só com ícone, contraste dos pares usados ≥ 4.5:1 (SC-005), leitor de tela não lê nomes de ícones
- [ ] T128 Revisão responsiva final de todas as telas (`frontend/src/pages/*.tsx` × `codeconnect-design/telas/*.dc.html`) em 360, 768, 1024 e 1440px contra os protótipos (SC-001, SC-004), sem rolagem horizontal; corrigir os componentes (não as páginas) quando o problema for de um primitivo
- [ ] T129 Rodar os gates definidos no `Makefile`: `make frontend-lint`, `make frontend-test`, `make backend-test` e `make prod-build`, todos verdes
- [ ] T130 Executar o roteiro completo de [quickstart.md](./quickstart.md), inclusive a aba Rede sem requisições a `/api/` (SC-006) e o recarregamento restaurando os dados de exemplo (FR-004)
- [ ] T131 Abrir o PR para `master` com a checagem (seguindo `.specify/memory/constitution.md`) de conformidade com a constituição (os 5 princípios + gates) e as diferenças intencionais em relação aos protótipos na descrição

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: sem dependências.
- **Foundational (Fase 2)**: depende do Setup e **bloqueia todas as stories**.
- **User Stories (Fases 3–8)**: dependem só da Fase 2; podem ir em paralelo ou na ordem de
  prioridade (US1 → US2 → US3 → US4 → US5 → US6).
- **Polish (Fase 9)**: depois das stories desejadas.

### User Story Dependencies

- **US1 (P1)**: só a fundação.
- **US2 (P1)**: só a fundação. O teste de estado compartilhado com o feed (T081) usa as `routes`
  do app; se US1 ainda não existir, o T081 monta sua própria lista de rotas com `/` mínima (um
  `PostGrid` de `usePosts()`) e `/projeto/:id`.
- **US3 (P2)**: só a fundação. O teste (T093) verifica a navegação por
  `router.state.location.pathname` e o novo projeto por `usePosts()`, sem depender das telas de
  US1/US2; a conferência no feed fica na validação manual (T101).
- **US4 (P2)**: só a fundação.
- **US5 (P3)**: só a fundação (rotas fora do `AppLayout`).
- **US6 (P3)**: só a fundação.
- Arquivos compartilhados que as stories editam em sequência: `frontend/src/app/router.tsx`,
  `frontend/src/app/router.test.tsx`, `frontend/src/lib/validation.ts` e seu teste,
  `frontend/src/components/ui/index.ts`.

### Within Each User Story

- Testes primeiro, vistos falhando → utilitários/hooks → componentes de domínio → página →
  rota → validação manual.

### Parallel Opportunities

- Fase 1: T007 e T008 em paralelo (depois de T002–T006).
- Fase 2: testes `lib` (T011–T013) e suas implementações (T014–T016); T021/T022; T028/T029;
  testes de primitivos T032–T038; primitivos independentes T039, T042, T044–T052; T054; testes de
  post T063–T066; T068/T069.
- Cada story: as tarefas de teste marcadas [P] juntas; com a fundação pronta, US1, US4, US5 e US6
  podem ser feitas por pessoas diferentes ao mesmo tempo.

---

## Parallel Example: User Story 1

```bash
# Testes da US1 juntos (devem falhar):
Task: "Escrever frontend/src/features/feed/FeedFilters.test.tsx"
Task: "Escrever frontend/src/pages/FeedPage.test.tsx"
```

## Parallel Example: User Story 3

```bash
# Testes independentes:
Task: "Escrever frontend/src/lib/files.test.ts"
Task: "Escrever frontend/src/hooks/useObjectUrl.test.tsx"
Task: "Escrever frontend/src/features/publish/TagInput.test.tsx"
Task: "Escrever frontend/src/features/publish/ImageUpload.test.tsx"

# Implementações sem dependência entre si:
Task: "Implementar frontend/src/lib/files.ts"
Task: "Implementar frontend/src/hooks/useObjectUrl.ts"
```

## Parallel Example: Fase 2 (primitivos)

```bash
Task: "Escrever frontend/src/components/ui/Tabs.test.tsx"
Task: "Escrever frontend/src/components/ui/SearchBox.test.tsx"
Task: "Implementar frontend/src/components/ui/Avatar.tsx"
Task: "Implementar frontend/src/components/ui/CodeEditor.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Fase 1 (Setup) → Fase 2 (Foundational).
2. Fase 3 (US1) → **parar e validar**: feed navegável com busca, filtros, abas e menu.
3. Demonstrar.

### Incremental Delivery

1. Fundação pronta.
2. US1 (feed) → US2 (detalhe): o núcleo "ver e conversar sobre código".
3. US3 (publicar) → US4 (perfil): ciclo de contribuição e social.
4. US5 (login/cadastro) → US6 (sobre): telas de entrada e institucional.
5. Polish e PR. Cada story é commitada e validada antes da próxima.

### Parallel Team Strategy

Com a fundação pronta: pessoa A em US1 → US2, pessoa B em US3 → US4, pessoa C em US5 → US6. Os
únicos pontos de conflito são `router.tsx`, `router.test.tsx`, `validation.ts` e o barrel de
`ui` — combinar a ordem de merge.

---

## Notes

- [P] = arquivos diferentes, sem dependência de tarefa incompleta. Em uma implementação, [P]
  significa que ela pode andar em paralelo com outras implementações depois que o teste dela
  foi escrito e visto falhando.
- Rodar `make frontend-test` depois de cada teste novo para confirmar que **falha**, e de novo
  depois da implementação para confirmar que passa.
- Commitar por tarefa ou grupo lógico; o pre-commit não cobre o frontend, então rodar
  `make frontend-lint` antes de cada commit.
- Evitar: tarefas vagas, duas tarefas [P] no mesmo arquivo, páginas com estilo próprio.
