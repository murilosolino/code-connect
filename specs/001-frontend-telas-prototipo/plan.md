# Implementation Plan: Telas do frontend a partir dos protótipos (sem backend)

**Branch**: `feat/frontend-telas-prototipo` | **Date**: 2026-10-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-frontend-telas-prototipo/spec.md`

## Summary

Construir as 7 telas dos protótipos (Login, Cadastro, Feed, Publicar, Detalhe, Perfil, Sobre nós)
em uma SPA React com rotas reais, fiel ao `DESIGN.md`, funcionando só com dados de exemplo em
memória. A abordagem gira em torno de **reuso**: um design system pequeno de primitivos
(`components/ui`), um layout único para as telas internas e um para autenticação, componentes de
domínio compostos desses primitivos (`features/*`) e páginas que só compõem. Os dados ficam atrás
de um contrato de hooks (`contracts/data-store.md`) para que a integração com a API, numa feature
futura, troque a implementação sem tocar nas telas. Tudo desenvolvido em TDD com Vitest e
Testing Library.

## Technical Context

**Language/Version**: TypeScript 5.7 (strict), React 19, Node 22 (container `node:22-alpine`)

**Primary Dependencies**: Vite 7, Tailwind CSS 4 (`@tailwindcss/vite`), **novas**: `react-router` 7
(runtime); `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`,
`@testing-library/jest-dom` (dev)

**Storage**: N/A — estado em memória (React Context + `useReducer`), recriado a partir do seed a
cada carregamento (FR-004)

**Testing**: Vitest + Testing Library (componente e unidade) via `make frontend-test`;
`make frontend-lint` (`tsc -b --noEmit`); roteiro manual do [quickstart](./quickstart.md)

**Target Platform**: navegadores modernos (Chrome, Firefox, Safari, Edge atuais), 360–1440px

**Project Type**: web application (monorepo `frontend/` + `backend/`; só o `frontend/` muda)

**Performance Goals**: navegação entre telas e interações sem atraso perceptível (< 100 ms, tudo
local); nenhuma requisição de rede além de assets e fontes

**Constraints**: zero chamadas a `/api` (SC-006); só tokens do tema (sem hex ou tamanho
arbitrário); WCAG AA (contraste 4.5:1, foco visível, teclado); sem rolagem horizontal em 360px

**Scale/Scope**: 7 telas + 404, ~18 primitivos, ~14 componentes de domínio, 8 projetos e ~30
comentários de exemplo

Nenhum item ficou como NEEDS CLARIFICATION; as decisões estão em [research.md](./research.md).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio / regra | Como o plano atende | Status |
| --- | --- | --- |
| I. Container-first | Dependências via `make frontend-install pkg=…` dentro do container; novo alvo `make frontend-test` com descrição `##`; Dockerfile `dev`/`prod` intactos; nada de `node_modules` no host. | ✅ |
| I. Config por env | Nenhuma config nova; o proxy `/api` continua, só não é usado. | ✅ |
| II. Fidelidade ao design | Tokens em `src/styles/theme.css` (cópia do `tailwind-theme.css`); medidas que seriam arbitrárias viram tokens/`@utility` (research R4); divergências registradas nas Pendências do `DESIGN.md` (estado de erro, checkbox, estados vazios, skip link, ponto de quebra do menu, tokens semânticos, busca do Perfil só no desktop). | ✅ |
| II. Componentes reutilizáveis | Catálogo e matriz de reuso em [contracts/components.md](./contracts/components.md); regra de promoção (abaixo). | ✅ |
| II. Textos pt-BR | Todo texto de UI nas páginas/componentes, copiado dos protótipos; mensagens de FR-025. | ✅ |
| II. Lacunas confirmadas | Estado de erro e checkbox (Q2/Q3), estados vazios/não encontrado e skip link (FR-029/FR-030) definidos com tokens existentes e aprovados na análise; espaço reservado de mídia reaproveitado do protótipo do Publicar; logo em texto conforme HANDOFF. | ✅ |
| III. A11y e responsividade | Elementos semânticos (`Action` polimórfico), foco `focus-ring`, `aria-current/pressed/selected`, `Tabs` WAI-ARIA, skip link, testes por papel/nome; uma rota responsiva por tela, breakpoints `sm`/`lg` conforme `DESIGN.md` §5 (R13). | ✅ |
| IV. Test-first | Vitest + Testing Library adicionados; em `tasks.md` cada teste precede a implementação; reducer, seletores, `filterPosts`, validadores e componentes com lógica têm testes. Backend não muda (`make backend-test` segue verde). | ✅ |
| V. Arquitetura simples | Sem estado global mutável (store imutável via reducer); sem chamadas à API; YAGNI aplicado (sem Redux, sem CVA, sem libs de formulário). Novas dependências justificadas em Complexity Tracking. | ✅ |
| Fluxo Git | Implementação em `feat/frontend-telas-prototipo` (não na `master` nem em `docs/design-guidelines`); Conventional Commits; hooks ativos. | ⚠️ ação: criar a branch antes do `/speckit-implement` |
| Gates de PR | Quickstart cobre os 4 gates (testes, lint, revisão 360/1440, checagem de constituição na descrição do PR). | ✅ |

**Re-check pós-design (Fase 1)**: sem violações novas. O design adicionou apenas componentes e
hooks previstos no catálogo; as únicas dependências novas são as da tabela de Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/001-frontend-telas-prototipo/
├── spec.md
├── plan.md              # este arquivo
├── research.md          # decisões técnicas (Fase 0)
├── data-model.md        # entidades, store e transições (Fase 1)
├── quickstart.md        # como rodar e validar (Fase 1)
├── contracts/
│   ├── routes.md        # rotas e navegação
│   ├── components.md    # catálogo de componentes + matriz de reuso
│   └── data-store.md    # hooks/ações: a porta que a API vai substituir
├── checklists/requirements.md
└── tasks.md             # gerado por /speckit-tasks
```

### Source Code (repository root)

```text
frontend/
├── index.html                    # fontes Prompt/Roboto Mono/Material Symbols, lang pt-BR
├── vite.config.ts                # + bloco test (jsdom, setupFiles)
├── package.json                  # + react-router, vitest, testing-library; script "test"
└── src/
    ├── main.tsx                  # monta <App />
    ├── app/
    │   ├── App.tsx               # AppDataProvider + RouterProvider
    │   └── router.tsx            # árvore de rotas (contracts/routes.md)
    ├── styles/
    │   ├── index.css             # @import tailwindcss + theme + base (body bg-page, foco)
    │   └── theme.css             # @theme (tokens) + @utility (px-page, grid-cards…)
    ├── data/
    │   ├── types.ts              # User, Post, Comment, Reply, Viewer, PostView, UserView
    │   ├── seed.ts               # dados de exemplo extraídos dos protótipos
    │   ├── viewer.ts             # pessoa logada de exemplo (julio)
    │   └── store/
    │       ├── reducer.ts        # appReducer + createInitialState (puro)
    │       ├── selectors.ts      # selectPostView, selectUserView… (puro)
    │       ├── AppDataProvider.tsx
    │       └── hooks.ts          # usePosts, usePost, useComments, useUser, useUserPosts, useViewer, useAppActions
    ├── lib/
    │   ├── cx.ts
    │   ├── text.ts               # normalizeText, pluralize, formatHandle
    │   ├── validation.ts         # required, email, loginSchema, signupSchema, projectSchema
    │   └── files.ts              # validateImageFile
    ├── hooks/
    │   ├── useFormValidation.ts
    │   ├── useObjectUrl.ts
    │   └── usePageTitle.ts
    ├── components/
    │   ├── ui/                   # primitivos sem domínio
    │   │   ├── Action.tsx  Button.tsx  TextLink.tsx  Icon.tsx
    │   │   ├── TextField.tsx  FieldError.tsx  Checkbox.tsx  SearchBox.tsx
    │   │   ├── Tag.tsx  TagList.tsx  Tabs.tsx  Avatar.tsx  Logo.tsx
    │   │   ├── Surface.tsx  MediaPanel.tsx  MediaPlaceholder.tsx  CodeEditor.tsx  EmptyState.tsx
    │   │   └── index.ts          # barrel
    │   └── layout/
    │       ├── navigation.ts     # NAV_ITEMS + isActive
    │       ├── NavItem.tsx  Sidebar.tsx  MobileNav.tsx  AppLayout.tsx
    │       └── AuthScreen.tsx  SocialLoginButtons.tsx
    ├── features/
    │   ├── posts/                # PostCard, PostMedia, PostActions, PostGrid, filterPosts.ts
    │   ├── feed/                 # FeedFilters
    │   ├── users/                # UserBadge, ProfileHeader
    │   ├── comments/             # CommentThread, CommentLine, CommentForm
    │   └── publish/              # ImageUpload, TagInput
    ├── pages/
    │   ├── LoginPage.tsx  SignupPage.tsx  FeedPage.tsx  PublishPage.tsx
    │   ├── ProjectPage.tsx  ProfilePage.tsx  AboutPage.tsx  NotFoundPage.tsx
    └── test/
        ├── setup.ts              # jest-dom/vitest, cleanup
        └── renderWithProviders.tsx  # AppDataProvider + MemoryRouter com initialState/rota
```

Testes ficam **ao lado** do arquivo testado (`Button.test.tsx`, `reducer.test.ts`,
`FeedPage.test.tsx`). Arquivos removidos/substituídos: `src/App.tsx` (chamada a `/api/health`) e
`src/index.css` (vai para `styles/`).

Fora do `frontend/`: `Makefile` (alvo `frontend-test`), `DESIGN.md` (Pendências e §7 com tokens
semânticos), `CLAUDE.md` (remover "no frontend test runner yet" e citar `make frontend-test`).

**Structure Decision**: web application já existente; a feature só toca o `frontend/`. Dentro dele,
organização por **camadas de reuso** (`ui` → `layout` → `features` → `pages`) em vez de "uma pasta
por tela", porque a maior parte dos componentes é compartilhada entre telas (matriz em
`contracts/components.md`); só o que é exclusivo de uma tela fica em `features/<domínio>`.

## Boas práticas aplicadas

### Reuso e não duplicação

1. **Regra de promoção**: se um padrão visual ou de comportamento aparece em 2 lugares, vira
   componente (ou hook) antes de ser copiado. Ex.: `CommentLine` serve para comentário e resposta;
   `MediaPlaceholder` serve para a área de upload do Publicar e para o card sem imagem;
   `EmptyState` serve para busca sem resultado, abas vazias e os três "não encontrado";
   `PostGrid` serve para o Feed e as duas abas do Perfil; `AuthScreen` + `SocialLoginButtons`
   servem para Login e Cadastro; `NavItem` + `NAV_ITEMS` servem para o menu lateral e a barra.
2. **Variantes, não cópias**: diferenças de tamanho/estado são props tipadas (`variant`, `size`)
   com mapa de classes por variante (`satisfies Record<Variant, string>`), nunca um segundo
   componente parecido (`PostCard size="feed" | "page"`, `Button size="compact" | "md" | "lg"`).
3. **Polimorfismo semântico em um lugar**: `Action` decide entre `<Link>`, `<a>` e `<button>`;
   `Button`, `TextLink` e `NavItem` herdam isso, então navegação é sempre link e ação é sempre
   botão sem repetir a lógica.
4. **Páginas finas**: páginas só leem hooks, guardam estado de tela e compõem componentes; não
   contêm classes de cor/tipografia (apenas layout: grid, gap, ordem).
5. **Uma fonte por regra**: filtros/busca (`filterPosts`), validação e mensagens
   (`lib/validation`), itens de menu (`navigation.ts`), dados (`seed.ts` atrás dos hooks), tokens
   (`theme.css`).
6. **Direção de dependência**: `ui` não importa `features`, `data` nem `pages`; `features` não
   importa `pages`. Assim os primitivos continuam genéricos e reaproveitáveis.

### Design system

- Só tokens do tema; nada de `slate-*`, hex ou `[...]` arbitrário. Medidas novas viram token
  nomeado em `theme.css` com comentário de origem.
- Estados (hover clareia para `accent-hover`, foco `focus-ring` 2px offset 2px, ativo `accent`)
  definidos uma vez em cada primitivo.
- `className` externo aceito só para posicionamento/layout (margem, largura, ordem), nunca para
  mudar cor ou tipografia de um primitivo.

### Acessibilidade

- HTML semântico; `<label htmlFor>` em todos os campos (rótulo visualmente oculto quando o
  protótipo não mostra, como na busca e no comentário).
- `aria-current`, `aria-pressed`, `aria-selected`, `aria-invalid`/`aria-describedby` expostos
  pelos componentes, não pelas páginas.
- Ícones `aria-hidden`; botões só com ícone com `aria-label` ("Remover filtro React").
- Skip link "Pular para o conteúdo" no `AppLayout`; um `<h1>` por página; `<main>` único.
- Testes consultam por papel e nome acessível (`getByRole('button', { name: 'Comentar' })`), o que
  falha se a semântica quebrar.

### TypeScript e React

- `strict` já ativo; sem `any`; tipos de domínio em `data/types.ts`; `IconName` como união literal.
- Componentes de função, props tipadas, `ref` como prop (React 19), `useId` para ids de campo.
- Estado derivado calculado (`useMemo` só quando a lista for filtrada/ordenada), nunca duplicado
  no estado.
- Reducer imutável; ids gerados pelo store (`nextId`), não por `Math.random`.

### Testes (TDD)

- Ordem por camada: utilitários puros → reducer/seletores → primitivos com lógica (`Tabs`,
  `TextField` com erro, `Checkbox`, `Tag` removível, `Button` como link/botão) → componentes de
  domínio → páginas (fluxos das user stories com `renderWithProviders`).
- Um teste de fumaça garante que renderizar todas as rotas não chama `fetch` (SC-006).
- Primitivos puramente visuais (`Surface`, `MediaPanel`, `Logo`) não precisam de teste próprio:
  são cobertos pelos testes de quem os usa.

## Ordem de implementação

1. **Fundação**: branch, dependências, Vitest + `make frontend-test`, tokens (`theme.css`),
   fontes, `lib/*`, tipos, seed, store (reducer, seletores, hooks) — com testes.
2. **Primitivos** (`components/ui`) — com testes dos que têm lógica.
3. **Layouts**: `AppLayout` (menu lateral/barra) + roteador + `NotFoundPage`; `AuthScreen`.
4. **Telas por prioridade** da spec, cada uma com seus componentes de domínio:
   Feed (US1) → Detalhe (US2) → Publicar (US3) → Perfil (US4) → Login/Cadastro (US5) → Sobre (US6).
5. **Acabamento**: revisão 360/768/1024/1440px contra os protótipos, teclado e contraste;
   `DESIGN.md` (Pendências e §7) e `CLAUDE.md` atualizados.

## Notas de escopo

- A busca do Perfil existe só no protótipo desktop; o plano a mantém só a partir de `lg` (US4-4) e
  reutiliza `filterPosts` para filtrar a aba ativa. Registrar no `DESIGN.md` como divergência
  conhecida entre versões.
- O feed reabre sempre com os filtros iniciais (estado local); um projeto publicado aparece no
  topo de "Recentes" quando corresponde aos filtros ativos (FR-014).
- "Compartilhar" e "Responder" são exibidos sem ação (Assumptions da spec).

## Complexity Tracking

| Adição | Por que é necessária | Alternativa mais simples rejeitada porque |
| --- | --- | --- |
| `react-router` (runtime) | Endereço próprio por tela, deep link, `NavLink` com `aria-current`, rotas aninhadas para não repetir o layout (FR-001, FR-007). | Roteador próprio reimplementaria params, links ativos e 404, com mais código para testar. |
| `vitest` + `jsdom` (dev) | Princípio IV exige testes de componente; integra com a config do Vite. | Jest precisaria de pipeline de transformação separado do Vite. |
| `@testing-library/react`, `user-event`, `jest-dom` (dev) | Testar comportamento por papel/nome acessível, como a pessoa usa a tela. | Testes de snapshot/implementação não validam a11y nem fluxos e quebram com refatorações. |
| Camada `data/store` com hooks | FR-003: trocar o mock pela API sem reescrever telas; FR-004: estado compartilhado entre telas. | Estado local por página perde as alterações ao navegar; importar o seed direto acopla as telas ao mock. |
