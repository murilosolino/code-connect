# Research — Telas do frontend a partir dos protótipos

Decisões técnicas da Fase 0. Cada item: **Decisão**, **Racional**, **Alternativas consideradas**.

## R1. Roteamento

- **Decisão**: `react-router` v7 em modo declarativo/data (`createBrowserRouter` + `RouterProvider`),
  com rotas aninhadas: um layout `AuthLayout` (Login, Cadastro) e um `AppLayout` (telas internas)
  renderizando `<Outlet />`. `NavLink` para o estado de página atual (`aria-current="page"`).
- **Racional**: a spec exige endereço próprio por tela, deep link e recarregamento (FR-001, Edge
  Cases). O HANDOFF já prevê react-router. O nginx de produção já tem `try_files $uri /index.html`.
  Rotas aninhadas eliminam a repetição do menu/layout em cada página.
- **Alternativas**: roteador próprio com `history.pushState` (reinventa `NavLink`, params e 404;
  mais código para testar); `HashRouter` (URLs feias e desnecessário, o nginx já faz fallback);
  TanStack Router (mais pesado e fora do padrão do HANDOFF).

## R2. Testes de componente (Princípio IV)

- **Decisão**: Vitest + jsdom + `@testing-library/react` + `@testing-library/user-event` +
  `@testing-library/jest-dom`. Configuração dentro do `vite.config.ts` (`test: { environment:
  'jsdom', setupFiles }`), importando `describe/it/expect` explicitamente (sem `globals`). Novo
  script `npm test` (`vitest run`) e novo alvo `make frontend-test`.
- **Racional**: Vitest reaproveita a config do Vite (plugins, aliases), roda no mesmo container e é
  o par natural do Vite 7. Testing Library força queries por papel/nome acessível, o que testa a
  acessibilidade (Princípio III) junto com o comportamento.
- **Alternativas**: Jest (exige transform/ESM separados do Vite); Playwright para tudo (lento para
  TDD de componente; pode entrar depois para regressão visual); `vitest-axe`/`jest-axe` (útil, mas
  dependência extra — adiado; queries por papel + revisão manual cobrem o gate desta etapa).

## R3. Estado e fonte de dados sem backend

- **Decisão**: uma única fonte de verdade em memória: `AppDataProvider` (React Context +
  `useReducer`) inicializado com o seed de `src/data/seed.ts`. Componentes nunca importam o seed
  direto: leem por hooks (`usePosts`, `usePost`, `useComments`, `useUser`, `useViewer`) e
  alteram por ações (`toggleApproval`, `addComment`, `toggleFollow`, `publishPost`). O reducer e os
  seletores são funções puras, testadas isoladamente.
- **Racional**: FR-003 (fonte isolada para trocar pela API depois) e FR-004 (alterações refletidas
  em todas as telas, só em memória, recarregar restaura o seed). Na integração, só a implementação
  dos hooks muda; as telas continuam iguais (ver `contracts/data-store.md`).
- **Alternativas**: Zustand/Redux (dependência sem necessidade para 4 ações — YAGNI); estado local
  em cada página (perde as alterações ao navegar, viola FR-004); `localStorage` (descartado na
  clarificação Q1).

## R4. Tokens de design no Tailwind 4

- **Decisão**: `src/styles/theme.css` com o `@theme` de `codeconnect-design/tailwind-theme.css`
  (paleta base + tokens semânticos `bg-page`, `bg-surface`, `text-primary`, `accent`…), copiado
  para dentro do `frontend/` porque `codeconnect-design/` é git-ignored. Valores de layout que o
  HANDOFF escrevia como arbitrários viram tokens nomeados ou utilitários `@utility`:

  | Necessidade | Token/utilitário |
  | --- | --- |
  | Borda inset 1px (botões, search) | `--shadow-outline` / `--shadow-outline-hover` → `shadow-outline` |
  | Borda inset 2px de erro (FR-026) | `--shadow-field-error` → `shadow-field-error` |
  | Padding lateral `clamp(16px, 5vw, 80px)` | `@utility px-page` |
  | Grid `repeat(auto-fill, minmax(min(100%,400px),1fr))` | `@utility grid-cards` |
  | Card do feed até 486px; página 993px | `--container-card-feed`, `--container-card-page` |
  | Textarea 161px | `--spacing-textarea` → `h-textarea` |
  | Borda inset 1px `cinza-escuro` (espaço reservado de mídia) | `--shadow-outline-dark` → `shadow-outline-dark` |
  | Avatares 32/160/208/254px, ícones 24/32px | já em `tailwind-theme.css` (`size-avatar-sm`…) |
  | Container 1280px, menu 240px, editor 320px, mídia 240px | escala padrão (`max-w-7xl`, `w-60`, `h-80`, `h-60`) |

- **Racional**: o Princípio II proíbe hex avulso e tamanhos arbitrários; nomear cada medida
  mantém a regra e documenta a intenção. Os tokens semânticos são a forma recomendada pelo HANDOFF
  e já mapeiam 1:1 a paleta do `DESIGN.md`.
- **Alternativas**: usar classes arbitrárias (`max-w-[1280px]`) como no HANDOFF (viola o
  Princípio II); importar o arquivo de `codeconnect-design/` (quebra no CI e em outra máquina).
- **Pendência**: registrar no `DESIGN.md` §7 os tokens semânticos adotados e o fundo de página
  `grafite #00090E` usado pelos protótipos (hoje Pendência 5).

## R5. Variantes de componentes sem dependência extra

- **Decisão**: cada componente com variantes declara um mapa `const variants = { primary: '…',
  secondary: '…' } satisfies Record<Variant, string>` e junta classes com um helper local
  `cx(...classes)` de ~5 linhas em `src/lib/cx.ts`.
- **Racional**: tipagem forte das variantes, zero dependência, fácil de testar.
- **Alternativas**: `clsx` + `class-variance-authority` (duas dependências para algo trivial nesta
  escala); classes duplicadas nas páginas (viola "não duplicar componentes").

## R6. Botão que também é link

- **Decisão**: `Button` aceita `to` (vira `Link` do router) ou `onClick`/`type` (vira `<button>`).
  Uma única fonte de estilo para "Publicar" do menu, "Login", "Voltar ao feed", "Publicar um
  projeto" etc. O mesmo vale para o item de menu (`NavItem`), que é sempre `NavLink`, exceto "Sair"
  (link para `/login`).
- **Racional**: semântica correta (navegação = link, ação = botão — Princípio III) sem duplicar
  estilos.
- **Alternativas**: `<button onClick={navigate}>` para navegação (semântica errada, perde
  "abrir em nova aba"); dois componentes `Button`/`LinkButton` (duplicação).

## R7. Ícones e fontes

- **Decisão**: Prompt (400/500/600), Roboto Mono e Material Symbols Outlined (`FILL 1`,
  `display=block`) carregados por `<link>` no `index.html`, como no HANDOFF. `Icon` renderiza
  `<span className="material-symbols-outlined" aria-hidden="true">` com tamanho por prop
  (`sm`=15, `md`=24, `lg`=32).
- **Racional**: `display=block` evita mostrar o nome da ligadura como texto durante o
  carregamento; `aria-hidden` impede o leitor de tela de ler "arrow_forward" (Edge Case da spec).
  Ícone novo usado pelo estado de erro: `error`; pelo checkbox: `check`.
- **Alternativas**: SVGs próprios (proibido pelo `DESIGN.md` §6); pacote npm de ícones (peso extra
  e diverge do design).

## R8. Busca e filtros

- **Decisão**: função pura `filterPosts(posts, { query, tags, sort })` em
  `src/features/posts/filterPosts.ts`:
  - `query`: normalizada com `normalize('NFD')` + remoção de diacríticos + `toLocaleLowerCase('pt-BR')`,
    comparada a título e descrição;
  - `tags`: mantém posts com ao menos uma tag igual (mesma normalização); lista vazia = todos;
  - `sort`: `recentes` (ordem do store, mais novo primeiro) ou `populares` (aprovações desc., empate
    mantém a ordem original — `Array.prototype.toSorted` é estável).
  Reaproveitada no Feed e na busca do Perfil (desktop).
- **Racional**: uma só regra de filtragem testada por unidade, consumida por duas telas.
- **Alternativas**: filtrar dentro de cada página (duplicação); biblioteca de busca fuzzy (YAGNI).
- **Consequência visível**: com os filtros iniciais (Front-end, React, Acessibilidade), o feed abre
  mostrando só os projetos com essas tags, como pede o HANDOFF — diferente do protótipo, que não
  filtrava. US1-1 da spec foi ajustado para refletir isso.

## R9. Validação de formulários (FR-025 a FR-027)

- **Decisão**: validadores puros (`required`, `email`) em `src/lib/validation.ts`, compostos em um
  esquema por formulário (`loginSchema`, `signupSchema`, `projectSchema`), e um hook único
  `useFormValidation(schema)` que guarda valores/erros, valida no submit, limpa o erro do campo ao
  corrigi-lo e devolve a chave do primeiro campo inválido para o formulário focar (via
  `ref` registrado por campo). `TextField` recebe `error` e cuida de `aria-invalid`,
  `aria-describedby` e da linha de erro (`FieldError`). A mensagem fica em uma região
  `aria-live="polite"` (não `role="alert"`), para que vários erros de uma vez não interrompam a
  leitura uns dos outros; o foco no primeiro campo inválido já leva a pessoa ao problema.
- **Racional**: as três telas compartilham regra, hook e visual de erro; nada é repetido.
- **Alternativas**: React Hook Form/Zod (duas dependências para 7 campos); validação nativa do
  navegador (descartada na clarificação Q2).

## R10. Carregamento de imagem

- **Decisão**: `<input type="file" accept="image/png,image/jpeg">` visualmente escondido e acionado
  pelo `Button` terciário; função pura `validateImageFile(file)` (tipo PNG/JPEG e ≤ 5 MB) e
  prévia com `URL.createObjectURL`. A URL anterior é revogada ao trocar de imagem ou ao descartar;
  a URL do projeto publicado fica viva durante a sessão (o detalhe precisa dela).
- **Racional**: FR-013, cenários US3-1/US3-2, sem upload real.
- **Alternativas**: `FileReader` → data URL (mais memória, mais lento para 5 MB).

## R11. Contagem de comentários e dados de exemplo

- **Decisão**: o contador de comentários é **derivado** do número de comentários de primeiro nível
  do projeto (respostas não contam, como no protótipo de Detalhe: 3 comentários → 3). O seed
  completa comentários de exemplo para os demais projetos de modo que os contadores batam com os
  dos protótipos (auth 7, landing 2, memória 5, clima 2, tarefas 6, calendário 4, portfólio 1).
  O seed tem **8 projetos** (6 do Feed + "Calendário acessível" e "Portfólio com Astro" do Perfil),
  uma pessoa por autor e Júlio como pessoa logada (`approvedPostIds: ['auth', 'tarefas']`, que
  alimentam a aba "Aprovados").
- **Racional**: uma fonte de verdade sem contadores divergentes; o Feed lista todos os projetos do
  store (o projeto do perfil precisa existir no store para abrir seu detalhe).
- **Alternativas**: contador armazenado separado da lista (fica incoerente: "7 comentários" e
  lista vazia); manter os 2 projetos do perfil fora do feed (duas fontes de dados).

## R12. Identidade da pessoa logada

- **Decisão**: Júlio (`julio`) é a pessoa logada: perfil no menu, autor dos projetos publicados e
  dono das aprovações. Novos comentários aparecem como `@voce` (inicial "V"), exatamente como no
  protótipo e na spec.
- **Racional**: fidelidade ao protótipo e à spec (Key Entities). Fica isolado em
  `src/data/viewer.ts` para a integração substituir.

## R13. Responsividade

- **Decisão**: breakpoints padrão do Tailwind: `< sm` (< 640px) mobile, `sm`–`lg` (640–1023px)
  tablet, `≥ lg` (1024px) desktop com menu lateral. Tablet usa a barra horizontal com rótulos 22px
  e avatar de perfil 208px; mobile, rótulos 18px e avatar 160px (`DESIGN.md` §5). Validação em
  360, 768, 1024 e 1440px (SC-004).
- **Racional**: FR-005 e Princípio II — o `DESIGN.md` define o tablet com referência de 768px e
  menu horizontal e o desktop a partir de ~995–1000px; ele prevalece sobre o HANDOFF (que usava
  `md` = 768px). Divergência registrada na Pendência 11 do `DESIGN.md`.
- **Alternativas**: `md` (768px) como no HANDOFF — rejeitado por contrariar o `DESIGN.md`.

## R14. Remoção da chamada a `/api/health`

- **Decisão**: o `App.tsx` atual (que chama `/api/health`) é substituído pelo `RouterProvider`.
  Nenhum código desta feature usa `fetch`.
- **Racional**: FR-002 / SC-006. Um teste garante que `fetch` não é chamado ao renderizar as rotas.
