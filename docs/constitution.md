# CodeConnect Constitution

Este documento define as regras inegociáveis de engenharia do CodeConnect, uma rede para
compartilhar e comentar código. Os termos **DEVE** / **NÃO DEVE** indicam obrigações absolutas
(equivalentes a MUST / MUST NOT da RFC 2119); **DEVERIA** / **NÃO DEVERIA** indicam
recomendações fortes que só podem ser ignoradas com justificativa registrada (SHOULD /
SHOULD NOT); **PODE** indica algo opcional (MAY).

## Core Principles

### I. Ambiente Container-First

- Todo serviço (frontend, API, MySQL) DEVE rodar via Docker Compose, operado pelo `Makefile`
  (`make up`, `make logs`, `make backend-test`…). Um comando novo e recorrente DEVE ganhar um
  alvo no `Makefile` com descrição `##`.
- Dependências DEVEM ser instaladas dentro dos containers (`make frontend-install pkg=<nome>`,
  `make backend-tidy`); `node_modules` NÃO DEVE ser gerado no host.
- Configuração DEVE vir apenas de variáveis de ambiente com defaults seguros
  (`backend/internal/config`), declaradas em `.env.example` e mapeadas no
  `docker-compose.yml`. `.env` NÃO DEVE ser versionado.
- Os Dockerfiles DEVEM manter os targets `dev` (usado pelo Compose) e `prod`
  (`make prod-build` DEVE continuar funcionando).

**Racional**: um único ambiente reprodutível elimina o "funciona na minha máquina" e garante
que testes com `--race` (que exigem CGO) rodem igual para todos.

### II. Fidelidade ao Design System

- `DESIGN.md` é a fonte da verdade do design. `codeconnect-design/` (HANDOFF, `telas/*.dc.html`,
  tokens) é referência visual e de comportamento; em caso de divergência prevalece o
  `DESIGN.md`, e a divergência DEVE ser registrada em suas Pendências.
- A UI DEVE usar apenas os tokens do tema Tailwind (cores, escala tipográfica, raios,
  espaçamentos, sombra). Hex avulso, cores genéricas (`slate-*` etc.) e tamanhos arbitrários
  NÃO DEVEM ser usados.
- Elementos repetidos DEVEM ser componentes React reutilizáveis com variantes (`Button`,
  `TextField`, `Tag`, `PostCard`…), não classes duplicadas.
- Textos da interface DEVEM estar em português do Brasil, seguindo os fundamentos de conteúdo
  (segunda pessoa, verbos curtos em ações, maiúscula só na primeira palavra, sem emoji).
- Lacunas do design (itens ⚠️ / Pendências) DEVEM ser confirmadas antes de implementar; NÃO
  DEVEM ser inventadas.

**Racional**: a identidade visual (tema escuro, verde único de ação) só se mantém se cada tela
consumir os mesmos tokens e componentes.

### III. Acessibilidade e Responsividade (INEGOCIÁVEL)

- Interações DEVEM usar elementos semânticos reais (`<button>`, `<a>`/`Link`, `<input>` com
  `<label htmlFor>`); `div` clicável NÃO DEVE ser usado.
- Todo controle DEVE ter foco visível (anel sólido 2px `focus-ring` com offset 2px; o search
  box usa borda inset de 1px).
- Ícones decorativos DEVEM ter `aria-hidden`; botões só com ícone DEVEM ter `aria-label`;
  estados DEVEM ser expostos (`aria-current`, `aria-pressed`, `aria-selected`).
- Pares de cor de texto DEVEM manter contraste mínimo de 4.5:1, usando apenas os pares
  definidos no design system.
- Cada tela DEVE ser uma única rota responsiva, validada de 360px a 1440px (desktop com menu
  lateral; tablet/mobile com menu horizontal).

**Racional**: acessibilidade e responsividade são requisitos de aceitação, não melhorias
futuras; corrigi-las depois custa mais do que construir certo.

### IV. Test-First (INEGOCIÁVEL)

- TDD é obrigatório: o teste DEVE ser escrito e visto falhando antes da implementação
  (Red → Green → Refactor).
- Backend DEVE ter as duas camadas de teste:
  - **Unidade**: handlers e regras de negócio isolados (`httptest`, dependências
    substituíveis por interfaces/fakes), sem rede nem banco.
  - **Integração**: requisições HTTP reais pelo `router.New` contra o MySQL do Compose, com
    dados isolados por teste (database de teste dedicado ou transação revertida), cobrindo
    todo endpoint novo ou alterado, incluindo casos de erro.
- Todos os testes do backend DEVEM passar com `make backend-test` (`go test --race ./...`);
  `go fmt` e `go vet` DEVEM estar limpos (garantido pelo pre-commit).
- Frontend: `make frontend-lint` (`tsc -b --noEmit`) DEVE passar sem erros, e toda lógica de UI
  (estado, filtros, ordenação, handlers de formulário) DEVE ter testes de componente.
- Nenhuma mudança de comportamento DEVE ser mergeada sem os testes correspondentes.

**Racional**: testes escritos primeiro definem o contrato antes do código, e o `--race`
detecta concorrência incorreta que só apareceria em produção.

### V. Arquitetura Simples e Contratos Explícitos

- O backend DEVE seguir o fluxo `cmd/api/main.go` → `config.Load()` → `database.Connect()` →
  `router.New()`. Handlers DEVEM ser structs que recebem suas dependências (ex.:
  `handlers.Health{DB: db}`); estado global mutável NÃO DEVE ser usado.
- Toda rota DEVE ficar sob o grupo `/api`, trocar JSON e usar códigos HTTP corretos (`4xx` para
  erro do cliente, `5xx` para falha do servidor) com corpo de erro consistente.
- O frontend DEVE chamar apenas URLs relativas `/api/...` (proxy do Vite / nginx).
- YAGNI: começar pelo mais simples que atende aos requisitos. Nova dependência, camada ou
  abstração DEVE ser justificada na descrição do PR.

**Racional**: poucas camadas e dependências explícitas mantêm o código testável (Princípio IV)
e fácil de entender por qualquer pessoa do time.

## Restrições Técnicas e de Segurança

- **Stack fixa**: React 19 + Vite 7 + Tailwind 4 + TypeScript no frontend; Go + Gin no
  backend; MySQL como banco. Trocar qualquer peça DEVE passar por emenda desta constituição.
- **TypeScript**: código do frontend DEVE ser TypeScript; `any` NÃO DEVERIA ser usado sem
  comentário justificando.
- **Segredos**: credenciais DEVEM existir apenas em `.env` / variáveis de ambiente; NÃO DEVEM
  aparecer no código, em logs ou em commits.
- **SQL**: consultas DEVEM ser parametrizadas; concatenar entrada do usuário em SQL é proibido.
- **Validação**: toda entrada externa DEVE ser validada no backend, mesmo que o frontend já
  valide.
- **CORS**: a API DEVE aceitar apenas as origens de `CORS_ORIGIN`.
- **Schema**: mudanças no banco DEVEM ser versionadas no repositório (scripts em `db/` ou
  ferramenta de migração adotada) e reproduzíveis a partir de um banco vazio.

## Fluxo de Desenvolvimento e Quality Gates

- Trabalho NÃO DEVE ser feito diretamente na `master`. Branches DEVEM seguir
  `<tipo>/<descricao-em-kebab-case>` (ex.: `feat/feed-filtros`, `fix/login-foco`).
- Commits DEVEM seguir Conventional Commits (`feat:`, `fix(backend):`, `docs:`, `chore:`…).
- Os hooks DEVEM estar instalados (`make hooks-install`); `--no-verify` NÃO DEVE ser usado.
- Gates obrigatórios antes do merge de um PR:
  1. `make backend-test` passando (unidade + integração, com `--race`);
  2. `make frontend-lint` passando e testes de componente do frontend passando;
  3. telas novas ou alteradas revisadas contra `DESIGN.md` e os protótipos em 360px e 1440px;
  4. checagem de conformidade com esta constituição registrada na descrição do PR.

## Governance

- Esta constituição prevalece sobre qualquer outra prática do projeto. `CLAUDE.md` (guia
  operacional para agentes), `DESIGN.md` e `README.md` são guias de execução e NÃO DEVEM
  contradizê-la; havendo conflito, o guia DEVE ser corrigido.
- **Emendas**: feitas por PR dedicado que altera `docs/constitution.md`, com justificativa e
  plano de migração quando houver código em desacordo.
- **Versionamento** (SemVer):
  - MAJOR: remoção ou redefinição incompatível de princípio ou regra de governança;
  - MINOR: princípio ou seção nova, ou orientação materialmente ampliada;
  - PATCH: esclarecimentos, redação e correções sem mudança de significado.
- **Conformidade**: todo PR DEVE verificar aderência. Violação só é aceita se justificada na
  descrição do PR, com a alternativa mais simples rejeitada explicada.

**Version**: 2.0.0 | **Ratified**: 2026-10-07 | **Last Amended**: 2026-11-10
