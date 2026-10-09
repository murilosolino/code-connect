# feat(frontend): telas do CodeConnect a partir dos protótipos (sem backend)

Implementa as 7 telas dos protótipos (`codeconnect-design/telas`) em uma SPA React com rotas reais,
fiel ao `DESIGN.md`, funcionando **só com dados de exemplo em memória**. Nenhuma chamada ao backend
é feita (FR-002 / SC-006). A integração com a API é uma feature futura.

Spec: [`specs/001-frontend-telas-prototipo`](./spec.md) · Plano: [plan.md](./plan.md) · Tarefas: [tasks.md](./tasks.md)

## O que muda

| Rota | Tela |
| --- | --- |
| `/` | Feed: busca, filtros por tag, abas Recentes/Populares |
| `/projeto/:id` | Detalhe: aprovar, comentários com respostas, novo comentário |
| `/publicar` | Novo projeto: imagem (PNG/JPG até 5 MB), tags, validação |
| `/perfil/:handle` | Perfil: seguir, abas Projetos/Aprovados, busca (desktop) |
| `/login`, `/cadastro` | Formulários com validação (sem autenticação real) |
| `/sobre` | Sobre nós |
| `*` | Página não encontrada |

Organização (`frontend/src`), com dependência só para baixo
(`pages → features → components/layout → components/ui → lib`):
`app/` (rotas), `styles/` (tokens), `data/` (seed + store em memória + hooks), `components/ui`
(primitivos do design system), `components/layout`, `features/`, `pages/`, `lib/`, `hooks/`.

- **Dados atrás de hooks** (`usePosts`, `usePost`, `useComments`, `useUser`, `useUserPosts`,
  `useViewer`, `useAppActions`): as telas nunca leem o seed; na integração só a implementação dos
  hooks muda (`contracts/data-store.md`).
- **Reuso**: um único `Button`/`TextLink`/`NavItem` sobre a base `Action` (link ou botão),
  `PostCard`/`PostGrid` no Feed e no Perfil, `CommentLine` para comentário e resposta,
  `AuthScreen` em Login e Cadastro, `useFormValidation` em três formulários, `filterPosts` em duas
  telas, `EmptyState`/`NotFoundState` em todos os estados vazios.
- **Tooling**: `react-router`, Vitest + Testing Library (`make frontend-test`), `@types/node`.

## Conformidade com a constituição

| Princípio / gate | Situação |
| --- | --- |
| I. Container-first | Dependências instaladas dentro do container; alvo `make frontend-test` (com `##`); Dockerfiles `dev`/`prod` intactos; `make prod-build` verde. |
| II. Fidelidade ao design | Só tokens do tema: auditoria sem hex fora de `theme.css`, sem `slate-*`, sem classes arbitrárias, sem `style` inline. Medidas conferidas no navegador contra os protótipos. Lacunas do design confirmadas e registradas nas Pendências 7–19 do `DESIGN.md`. Textos em pt-BR. |
| III. Acessibilidade e responsividade | Elementos semânticos; foco visível (verificado com Tab real); `aria-current/pressed/selected/invalid`; um `h1` por tela; link "Pular para o conteúdo"; 26 pares de cor ≥ 4,5:1 (borda de erro 3,5:1 ≥ 3:1). 4 larguras × 11 rotas sem overflow horizontal (360/768/1024/1440px). |
| IV. Test-first | Testes escritos e vistos falhando antes de cada implementação. **271 testes em 41 arquivos** passando. Backend sem alterações. |
| V. Arquitetura simples | Sem estado global mutável (reducer puro); sem camadas além das justificadas em Complexity Tracking (`react-router`, Vitest/Testing Library, camada `data/store`). |
| Gate 1 — `make backend-test` | ✅ (sem arquivos de teste no backend; nada alterado) |
| Gate 2 — `make frontend-lint` + testes | ✅ `tsc -b --noEmit` limpo; 271/271 |
| Gate 3 — revisão contra `DESIGN.md` e protótipos | ✅ 360 e 1440px, mais 768 e 1024px |
| Gate 4 — `make prod-build` | ✅ JS 360 kB (114 kB gzip), CSS 21,8 kB; nginx serve o SPA em rotas profundas |

## Diferenças intencionais em relação aos protótipos

Detalhes nas Pendências do `DESIGN.md`.

- **Menu lateral só a partir de 1024px** (o HANDOFF usava 768px; o `DESIGN.md` define o tablet com
  menu horizontal e prevalece) — Pendência 11.
- **Estado de erro de campo, checkbox marcado, estados vazios e link "Pular para o conteúdo"**
  não existem no Figma; foram definidos só com tokens existentes — Pendências 7–10.
- O Feed **filtra** pelos filtros iniciais (o protótipo não filtrava) — 13.
- Cards "API de autenticação" e "Lista de tarefas" já vêm aprovados pela pessoa logada de exemplo — 14.
- "Publicar" vem antes de "Descartar" no HTML; no desktop a ordem visual é invertida — 15.
- A grade do feed tem 2 colunas só a partir de ~1230px (colunas de no mínimo 400px); com uma coluna
  o card respeita a largura máxima de 486px — FR-009 e Pendência 16.
- "Compartilhar" e "Responder" não têm ação (não definida nos protótipos); "Compartilhar" é só um
  contador, sem controle que não faz nada.

## Achados durante a validação visual (corrigidos)

Três problemas que os testes de unidade não pegam, achados medindo no navegador:

1. Todos os ícones saíam com 24px: a folha do Google define `font-size: 24px` fora de qualquer
   layer e vencia os utilitários do Tailwind. Agora os ícones usam a classe própria `.material-icon`.
2. O texto da senha saía `cinza-escuro` em vez de `grafite` (duas classes de cor disputavam).
3. Uma palavra longa sem espaços em tag, `@handle` ou comentário esticava o card (uma tag de 78
   caracteres media 668px num card de 328px): `break-words` não reduz o tamanho mínimo de itens
   flex; trocado por `wrap-anywhere`.

## Como validar

Siga [quickstart.md](./quickstart.md). Resumo:

```bash
make up
make frontend-lint
make frontend-test
make backend-test
make prod-build
```

Em seguida percorra as telas em 360px e 1440px (e 768px/1024px), só com teclado, e confira na aba
Rede que não há requisições a `/api/`. Recarregar a página restaura os dados de exemplo (FR-004).

## Notas para quem revisa

- Depois de mudar `package.json`, recrie as imagens (`make build` e `make up`): `node_modules` fica
  num volume nomeado.
- `make frontend-lint` já falhava na `master` (`process` sem `@types/node` em `vite.config.ts`);
  corrigido com `@types/node` e uma referência de tipos só nesse arquivo.
- O `testTimeout` do Vitest é 15 s: o `user-event` num container que também roda o Vite passa dos 5 s
  padrão sob carga.
- `Responder` é um botão sem ação (o fluxo de resposta não existe nos protótipos).
- `ImageUpload` não revoga a URL da prévia ao publicar (o projeto a usa); ao descartar, revoga.
- No Windows sem `make`: `docker compose exec frontend npm test` (e equivalentes); os scripts do
  Spec Kit precisam de `PYTHONIOENCODING=utf-8`.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
