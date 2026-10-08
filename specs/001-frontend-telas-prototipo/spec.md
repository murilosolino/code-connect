# Feature Specification: Telas do frontend a partir dos protótipos (sem backend)

**Feature Branch**: `feat/frontend-telas-prototipo`

**Created**: 2026-10-08

**Status**: Draft

**Input**: User description: "é necessário construir as telas que estão presentes em ./codeconnect-desing/telas neste momento não quero a integração com o backend porque o mesmo não está implementado. Para este primeiro momento especifique apenas a tarefa de construit o frontend com base nos protótipos."

## Contexto

O CodeConnect é uma rede para compartilhar e comentar código. A pasta local
`codeconnect-design/telas/` traz protótipos (desktop e mobile) de sete telas: Login, Cadastro,
Feed, Publicar (novo projeto), Detalhe do projeto, Perfil e Sobre nós. Esta feature entrega
essas telas navegáveis e interativas, fiéis ao `DESIGN.md` e aos protótipos, usando **apenas
dados de exemplo locais** — nenhuma comunicação com a API acontece nesta etapa. A integração com
o backend será uma feature posterior.

## Clarifications

### Session 2026-10-08

- Q: As alterações feitas sem backend devem sobreviver ao recarregamento? → A: Não; ficam só em
  memória e recarregar restaura os dados de exemplo (FR-004).
- Q: Como tratar campos obrigatórios vazios, já que o design não define estado de erro? → A:
  Criar um estado de erro alinhado aos tokens existentes, definido nesta spec (FR-025 a FR-028).
- Q: Qual o visual do checkbox marcado? → A: Borda e ícone `check` em `verde-destaque` (FR-027).
- Q (análise): menu lateral a partir de 768px (HANDOFF) ou seguindo o `DESIGN.md`? → A: segue o
  `DESIGN.md` — lateral a partir de 1024px, tablet com barra horizontal (FR-005).
- Q (análise): como ficam estados vazios/não encontrado e o skip link, ausentes do design? → A:
  definição provisória com componentes e tokens existentes (FR-029, FR-030).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegar pelo feed e encontrar projetos (Priority: P1)

Uma pessoa desenvolvedora abre o CodeConnect e vê o feed de projetos em cards (imagem/trecho
de código, título, descrição, tags, contadores de aprovações, compartilhamentos e comentários
e o autor). Ela busca por texto, aplica ou remove filtros por tag e alterna entre as abas
"Recentes" e "Populares". A partir de um card, segue para o detalhe do projeto ou para o
perfil do autor. O menu de navegação (lateral no desktop, barra horizontal no mobile/tablet)
leva a todas as telas internas.

**Why this priority**: o feed é a tela principal do produto e concentra o maior número de
componentes compartilhados (menu, card, tags, abas, busca). Sozinho já demonstra a identidade
visual e o valor da rede.

**Independent Test**: abrir o feed em 1440px e em 360px e verificar a lista de projetos,
busca, filtros, abas e a navegação pelo menu, sem precisar de nenhuma outra tela pronta.

**Acceptance Scenarios**:

1. **Given** o feed aberto com os dados de exemplo, **When** a pessoa vê a tela, **Then** a aba
   "Recentes" está ativa, os filtros iniciais "Front-end", "React" e "Acessibilidade" estão
   aplicados e são exibidos, na ordem original, os projetos de exemplo que têm alguma dessas
   tags (cenário 5). Os dados de exemplo reúnem os 6 projetos do protótipo do Feed e os 2
   projetos extras do protótipo do Perfil.
2. **Given** a aba "Recentes" ativa, **When** a pessoa seleciona "Populares", **Then** os
   projetos são reordenados por número de aprovações, do maior para o menor, e a aba
   "Populares" passa a ser indicada como selecionada.
3. **Given** filtros de tag aplicados, **When** a pessoa remove um filtro pelo seu botão de
   remover, **Then** a tag some da lista de filtros e a lista de projetos é recalculada.
4. **Given** filtros aplicados, **When** a pessoa aciona "Limpar tudo", **Then** todos os
   filtros são removidos, aparece a mensagem "Nenhum filtro aplicado." e a ação "Restaurar
   filtros", que devolve os três filtros iniciais.
5. **Given** filtros aplicados, **When** a lista é exibida, **Then** aparecem apenas projetos
   que tenham ao menos uma das tags filtradas (comparação sem diferenciar maiúsculas de
   minúsculas); sem filtros, todos os projetos aparecem.
6. **Given** o feed aberto, **When** a pessoa digita na busca, **Then** a lista mostra apenas
   projetos cujo título ou descrição exibida no card contenham o texto (sem diferenciar maiúsculas,
   minúsculas e acentos), combinando com os filtros de tag ativos.
7. **Given** um card de projeto, **When** a pessoa ativa a imagem, o título ou o ícone de
   comentários, **Then** vai para o detalhe daquele projeto; **When** ativa o autor, **Then**
   vai para o perfil do autor.
8. **Given** qualquer tela interna, **When** a pessoa usa o menu, **Then** "Publicar" leva ao
   novo projeto, "Feed" ao feed, "Perfil" ao perfil da pessoa logada de exemplo (`@julio`),
   "Sobre nós" ao Sobre e "Sair" ao Login, e o item da página atual fica destacado e anunciado
   como página atual para tecnologias assistivas.

---

### User Story 2 - Ver o detalhe de um projeto e interagir (Priority: P1)

A pessoa abre um projeto e vê o card em versão de página (trecho de código maior, título,
descrição, tags, ações e autor) e a seção de comentários. Ela aprova o projeto, lê os
comentários, expande ou recolhe respostas e adiciona um novo comentário.

**Why this priority**: é o destino de todos os cards e onde acontece a conversa sobre código,
proposta central do produto.

**Independent Test**: abrir o detalhe de um projeto e verificar aprovação, abertura de
respostas e inclusão de comentário, apenas com os dados de exemplo.

**Acceptance Scenarios**:

1. **Given** o detalhe de um projeto não aprovado, **When** a pessoa aciona "aprovar", **Then**
   o contador de aprovações aumenta em 1 e o botão passa a indicar estado aprovado (visual e
   anunciado como pressionado); **When** aciona de novo, **Then** volta ao valor e estado
   anteriores.
2. **Given** a lista de comentários de exemplo, **When** a tela abre, **Then** o primeiro
   comentário com respostas aparece com as respostas visíveis ("Ocultar respostas") e os demais
   com respostas recolhidas ("Ver respostas"); comentários sem respostas não mostram essa ação.
3. **Given** o campo de comentário preenchido, **When** a pessoa aciona "Comentar" ou pressiona
   Enter, **Then** o comentário é adicionado ao fim da lista como `@voce`, o campo é limpo e o
   contador de comentários do projeto aumenta em 1.
4. **Given** o campo de comentário vazio ou só com espaços, **When** a pessoa tenta comentar,
   **Then** nada é adicionado.
5. **Given** o detalhe aberto, **When** a pessoa aciona "Voltar ao feed", **Then** retorna ao
   feed; enquanto está no detalhe, o item "Feed" do menu aparece como ativo.

---

### User Story 3 - Publicar um novo projeto (Priority: P2)

A pessoa abre "Publicar", carrega uma imagem do código, informa nome, descrição e tags e
publica. Também pode descartar o rascunho.

**Why this priority**: é a principal ação de contribuição, mas depende do feed e do detalhe
para mostrar o resultado.

**Independent Test**: preencher o formulário de novo projeto, adicionar/remover tags, carregar
uma imagem e publicar, verificando a navegação para o projeto criado.

**Acceptance Scenarios**:

1. **Given** a tela Publicar sem imagem, **When** a pessoa aciona "Carregar imagem" e escolhe um
   arquivo PNG ou JPG de até 5 MB, **Then** a prévia da imagem é exibida no lugar do espaço
   vazio e o botão passa a se chamar "Trocar imagem".
2. **Given** um arquivo de outro formato ou maior que 5 MB, **When** a pessoa o escolhe,
   **Then** a imagem não é carregada e a pessoa é informada do motivo.
3. **Given** o campo de tags, **When** a pessoa digita uma tag e pressiona Enter, **Then** a tag
   é adicionada à lista e o campo é limpo; tags vazias ou repetidas não são adicionadas.
4. **Given** uma tag na lista, **When** a pessoa aciona o botão de remover daquela tag, **Then**
   ela sai da lista.
5. **Given** o formulário preenchido, **When** a pessoa aciona "Publicar", **Then** vai para o
   detalhe do projeto recém-criado, mostrando os dados informados.
6. **Given** a tela Publicar, **When** a pessoa aciona "Descartar", **Then** volta ao feed sem
   criar projeto.
7. **Given** a tela em largura mobile, **When** é exibida, **Then** o botão "Publicar" aparece
   antes de "Descartar".

---

### User Story 4 - Ver um perfil (Priority: P2)

A pessoa abre o perfil de alguém, vê avatar, `@handle`, nome, bio e estatísticas, segue ou
deixa de seguir e alterna entre os projetos da pessoa e os projetos que ela aprovou.

**Why this priority**: completa o ciclo social (autor → perfil → projetos), mas não bloqueia o
uso do feed e do detalhe.

**Independent Test**: abrir o perfil de exemplo e verificar seguir/deixar de seguir e a troca
entre abas.

**Acceptance Scenarios**:

1. **Given** o perfil de exemplo, **When** a pessoa aciona "Seguir", **Then** o botão passa a
   "Seguindo" e as conexões vão de 25 para 26; **When** aciona de novo, **Then** volta a
   "Seguir" e 25.
2. **Given** o perfil aberto, **When** a aba "Projetos" está ativa, **Then** são exibidos os 3
   projetos da pessoa; **When** a pessoa seleciona "Aprovados", **Then** são exibidos os
   projetos de outras pessoas que ela aprovou.
3. **Given** um endereço de perfil inexistente nos dados de exemplo, **When** a tela abre,
   **Then** é exibido o estado de perfil não encontrado (FR-029) com caminho de volta ao feed.
4. **Given** o perfil aberto em largura desktop (≥ 1024px), **When** a pessoa digita na busca,
   **Then** a aba ativa mostra só os projetos cujo título ou descrição exibida no card contenham
   o texto. A busca não aparece abaixo de 1024px, como nos protótipos (o mobile não a tem).
5. **Given** a aba "Aprovados" de um perfil sem projetos aprovados, **When** é selecionada,
   **Then** é exibido o estado vazio "Nenhum projeto aprovado ainda." (FR-029).

---

### User Story 5 - Entrar e criar conta (visual) (Priority: P3)

A pessoa vê as telas de Login e Cadastro, preenche os campos e entra (ou entra com GitHub ou
Google), indo para o feed. Pode alternar entre Login e Cadastro.

**Why this priority**: sem backend não há autenticação real; as telas existem para validar o
visual e o fluxo de navegação.

**Independent Test**: abrir Login e Cadastro em 1440px e 360px, alternar entre elas e
verificar que as ações levam ao feed.

**Acceptance Scenarios**:

1. **Given** a tela de Login, **When** a pessoa aciona "Login", "GitHub" ou "Google", **Then**
   vai para o feed.
2. **Given** a tela de Login, **When** a pessoa aciona "Crie seu cadastro!", **Then** vai para
   o Cadastro; **Given** o Cadastro, **When** aciona "Faça seu login!", **Then** vai para o
   Login.
3. **Given** a tela de Cadastro, **When** a pessoa aciona "Cadastrar", "GitHub" ou "Google",
   **Then** vai para o feed.
4. **Given** os campos de Login/Cadastro, **When** a pessoa aciona a ação principal com algum
   campo obrigatório vazio (ou email inválido no Cadastro), **Then** ela não vai para o feed,
   cada campo inválido mostra o estado de erro (FR-026) com sua mensagem e o foco vai para o
   primeiro campo inválido. As entradas por GitHub e Google não exigem os campos.
5. **Given** um campo em erro, **When** a pessoa o corrige, **Then** o erro daquele campo some.
6. **Given** a opção "Lembrar-me", **When** a pessoa a marca, **Then** o controle mostra o
   estado marcado (FR-027); **When** desmarca, **Then** volta ao estado normal.

---

### User Story 6 - Conhecer o CodeConnect (Priority: P3)

A pessoa abre "Sobre nós" e lê o propósito da rede, a missão, como funciona e para quem é,
com um convite para publicar um projeto.

**Why this priority**: conteúdo estático e de baixo risco.

**Independent Test**: abrir "Sobre nós" e conferir conteúdo e o botão "Publicar um projeto".

**Acceptance Scenarios**:

1. **Given** a tela Sobre nós, **When** é exibida, **Then** mostra o banner "Código em primeiro
   plano" e as seções Sobre nós, Nossa missão, Como funciona (3 itens com ícone) e Para quem é,
   com os textos do protótipo.
2. **Given** a tela Sobre nós, **When** a pessoa aciona "Publicar um projeto", **Then** vai para
   a tela Publicar.

---

### Edge Cases

- Busca e/ou filtros que não retornam nenhum projeto: o feed mostra o estado vazio "Nenhum
  projeto encontrado" (FR-029) em vez de uma área vazia.
- Endereço de projeto inexistente (`/projeto/<id>` desconhecido): estado "Projeto não
  encontrado" com caminho de volta ao feed (FR-029).
- Qualquer endereço desconhecido: estado "Página não encontrada" com caminho de volta ao feed
  (FR-029).
- Projeto sem imagem e sem trecho de código: a mídia do card mostra o mesmo espaço reservado da
  tela Publicar (ícone `code` com borda interna de 1px `cinza-escuro`), sem os textos de
  instrução.
- Recarregar a página ou abrir um endereço diretamente leva à tela correta (cada tela tem
  endereço próprio).
- Títulos, descrições, nomes de tags e `@handles` longos quebram linha sem estourar o card nem
  causar rolagem horizontal em 360px.
- Comentário ou tag com apenas espaços não é aceito; espaços nas pontas são removidos.
- Publicar sem nome ou sem descrição: o projeto não é criado e os campos mostram o estado de
  erro (FR-025/FR-026). A imagem e as tags são opcionais; sem imagem, o projeto criado mostra o
  espaço reservado do protótipo.
- Recarregar a página descarta projetos publicados, comentários, aprovações e "Seguir" feitos
  na sessão (FR-004).
- Navegação apenas por teclado em todas as telas, com foco sempre visível e ordem lógica.
- Fontes de ícones ainda carregando não devem expor o nome do ícone como texto lido por
  leitores de tela.

## Requirements *(mandatory)*

### Functional Requirements

**Escopo e dados**

- **FR-001**: A aplicação DEVE disponibilizar as sete telas dos protótipos — Login, Cadastro,
  Feed, Publicar, Detalhe do projeto, Perfil e Sobre nós — cada uma com endereço próprio.
- **FR-002**: Todas as telas DEVEM funcionar exclusivamente com dados de exemplo locais (os
  posts, comentários e perfis presentes nos protótipos); nenhuma requisição à API do backend
  DEVE ser feita nesta feature.
- **FR-003**: Os dados de exemplo DEVEM ficar concentrados em uma única fonte, isolada das
  telas, de forma que a futura troca pela API não exija reescrever as telas.
- **FR-004**: Alterações feitas pela pessoa (aprovação, novo comentário, seguir, projeto
  publicado) DEVEM refletir-se em todas as telas enquanto a página não for recarregada. Elas
  ficam apenas em memória: recarregar a página DEVE restaurar os dados de exemplo originais,
  e nada é guardado no navegador.

**Layout e navegação**

- **FR-005**: As telas internas (Feed, Publicar, Detalhe, Perfil, Sobre nós) DEVEM exibir o
  menu de navegação: lateral a partir de 1024px de largura (desktop, `DESIGN.md` §5: ~995–1000px+);
  barra horizontal abaixo disso, com logo e botão "Publicar" no topo — rótulos de 22px no tablet
  (640–1023px) e 18px no mobile (< 640px).
- **FR-006**: Login e Cadastro DEVEM ser exibidos sem o menu, com banner e formulário lado a
  lado no desktop e em coluna única com banner reduzido no mobile.
- **FR-007**: O item do menu correspondente à página atual DEVE ficar destacado e ser anunciado
  como página atual; no detalhe do projeto o item ativo é "Feed".
- **FR-008**: A navegação entre telas DEVE seguir o fluxo dos protótipos descrito nas user
  stories (menu, cards, autores, botões de Login/Cadastro, Publicar/Descartar, Voltar ao feed).

**Feed**

- **FR-009**: O feed DEVE listar os projetos em grade responsiva usando o card de projeto do
  design system, com colunas de no mínimo 400px: duas colunas quando a área de conteúdo comporta
  duas (a partir de ~1230px de largura de tela, como nos 1440px do protótipo) e uma coluna abaixo
  disso — inclusive no tablet e em 1024px com o menu lateral.
- **FR-010**: O feed DEVE oferecer busca por texto em título e descrição, filtros por tag
  removíveis com "Limpar tudo" e "Restaurar filtros", e abas "Recentes"/"Populares", todos
  combináveis entre si.

**Detalhe do projeto**

- **FR-011**: O detalhe DEVE permitir aprovar/desaprovar o projeto, atualizando o contador.
- **FR-012**: O detalhe DEVE listar comentários com respostas recolhíveis e permitir adicionar
  comentário (botão "Comentar" ou Enter), atualizando o contador de comentários.

**Publicar**

- **FR-013**: Publicar DEVE permitir carregar uma imagem PNG ou JPG de até 5 MB com prévia
  local, informar nome, descrição e tags (adicionar com Enter, sem duplicadas; remover pelo
  botão da tag) e publicar ou descartar.
- **FR-014**: Ao publicar, o novo projeto DEVE ser aberto em seu detalhe, com autor `@julio`,
  contadores zerados e as tags informadas, e passar a ser o primeiro projeto da aba "Recentes"
  do feed — exibido sempre que corresponder à busca e aos filtros ativos (o feed reabre com os
  filtros iniciais, como em US1-1).

**Perfil**

- **FR-015**: O perfil DEVE mostrar avatar, `@handle`, nome, bio e estatísticas, alternar
  "Seguir"/"Seguindo" atualizando as conexões, e alternar entre as abas "Projetos" e
  "Aprovados".

**Login, Cadastro e Sobre nós**

- **FR-016**: Login e Cadastro DEVEM exibir os campos do protótipo (Login: Email ou usuário,
  Senha, Lembrar-me, Esqueci a senha; Cadastro: Nome, Email, Senha, Lembrar-me) e as ações
  principal, GitHub e Google, todas levando ao feed sem autenticação real.
- **FR-017**: "Esqueci a senha" DEVE ser exibido como link, mas sem destino funcional nesta
  etapa (não há fluxo de recuperação nos protótipos).
- **FR-018**: Sobre nós DEVE exibir o conteúdo estático do protótipo e o botão "Publicar um
  projeto" levando a Publicar.

**Design, acessibilidade e responsividade**

- **FR-019**: Todas as telas DEVEM seguir o `DESIGN.md` (cores, tipografia, raios,
  espaçamentos, estados de hover/foco) e reproduzir os protótipos; divergências DEVEM ser
  registradas nas Pendências do `DESIGN.md`.
- **FR-020**: Elementos visuais repetidos (botões, campos, tags, abas, card de projeto, avatar,
  comentário, menu) DEVEM ser componentes reutilizáveis com variantes, compartilhados entre as
  telas.
- **FR-021**: Toda interação DEVE ser operável por teclado, com foco visível conforme o design
  system; controles com estado DEVEM expor esse estado (página atual, aba selecionada, botão
  pressionado); ícones decorativos DEVEM ser ignorados por leitores de tela e botões só com
  ícone DEVEM ter nome acessível (ex.: "Remover filtro React").
- **FR-022**: Cada tela DEVE ser uma única versão responsiva, sem rolagem horizontal e sem
  sobreposição de conteúdo entre 360px e 1440px de largura.
- **FR-023**: Todos os textos da interface DEVEM estar em português do Brasil, conforme os
  protótipos.
- **FR-024**: Enquanto o logo oficial não for fornecido, o logo DEVE ser exibido como o texto
  "CodeConnect" no estilo definido no HANDOFF.

**Validação de formulários**

- **FR-025**: A validação DEVE acontecer ao acionar a ação principal do formulário, não a cada
  tecla. Campos obrigatórios e mensagens:
  - Login: "Email ou usuário" → "Informe seu email ou usuário."; "Senha" → "Informe sua senha."
  - Cadastro: "Nome" → "Informe seu nome."; "Email" → "Informe seu email." (vazio) ou "Digite
    um email válido." (formato inválido); "Senha" → "Informe sua senha."
  - Publicar: "Nome do projeto" → "Informe o nome do projeto."; "Descrição" → "Informe a
    descrição do projeto."; imagem fora do formato → "Escolha uma imagem PNG ou JPG."; imagem
    acima do limite → "Escolha uma imagem de até 5 MB."
  Campos com apenas espaços contam como vazios. Ao falhar, o foco DEVE ir para o primeiro campo
  inválido; o erro de um campo DEVE sumir assim que ele for corrigido.
- **FR-026**: O estado de erro do campo DEVE usar apenas tokens existentes e não depender só de
  cor: campo com borda interna de 2px `branco` (mantendo fundo e altura do campo) e, 8px
  abaixo dele, linha com ícone `error` de 15px e a mensagem em Paragraph Small (15px) `offwhite`,
  gap 8px. O campo DEVE ser marcado como inválido e associado à mensagem para tecnologias
  assistivas, e a mensagem anunciada quando aparece. O anel de foco continua o padrão (2px
  `focus-ring`, offset 2px).
- **FR-027**: O checkbox marcado DEVE manter a caixa de 24×24px, raio 4px, e trocar a borda de
  2px para `verde-destaque`, com o ícone `check` centralizado em `verde-destaque`; desmarcado
  segue o `DESIGN.md`. O estado DEVE ser exposto a tecnologias assistivas.
- **FR-028**: As decisões de FR-026 e FR-027 DEVEM ser registradas no `DESIGN.md` como
  definições provisórias, a confirmar com design.

**Estados vazios e navegação acessível**

- **FR-029**: Estados vazios e de "não encontrado" (não existem no design; definição provisória
  registrada no `DESIGN.md`) DEVEM usar um único componente, composto só de tokens e componentes
  existentes: superfície `cinza-escuro` com raio 8px e padding 24px, ícone Material 32px
  `cinza-medio`, título Paragraph Large Semibold `cinza-claro`, texto Paragraph Small
  `cinza-medio` e, quando houver, botão secundário "Voltar ao feed". Textos:
  - busca/filtros sem resultado: "Nenhum projeto encontrado" / "Tente outra busca ou remova
    alguns filtros." (ícone `search`, sem botão);
  - projeto inexistente: "Projeto não encontrado" / "Confira o endereço ou volte ao feed para
    ver outros projetos." (ícone `info`);
  - perfil inexistente: "Perfil não encontrado" / "Confira o endereço ou volte ao feed para
    conhecer outras pessoas." (ícone `info`);
  - rota inexistente: "Página não encontrada" / "O endereço que você abriu não existe."
    (ícone `info`);
  - aba sem projetos no perfil: "Nenhum projeto publicado ainda." ou "Nenhum projeto aprovado
    ainda." (ícone `code`, sem botão).
- **FR-030**: As telas com menu DEVEM ter um link "Pular para o conteúdo" como primeiro item
  focável, invisível até receber foco e, focado, exibido no canto superior esquerdo com o
  visual do botão primário (definição provisória registrada no `DESIGN.md`).

### Key Entities

- **Projeto**: publicação de código. Identificador, título, descrição, tags, trecho de código ou
  imagem, contadores de aprovações, compartilhamentos e comentários, autor e se foi aprovado
  pela pessoa logada.
- **Comentário**: texto de uma pessoa em um projeto; autor, texto e lista de respostas (respostas
  têm autor e texto, sem novo nível de aninhamento).
- **Pessoa usuária / Perfil**: `@handle`, nome, inicial ou foto do avatar, bio, número de
  projetos e conexões, projetos publicados e projetos aprovados; se é seguida pela pessoa
  logada.
- **Pessoa logada (exemplo)**: identidade fixa usada nesta etapa (`@julio` para perfil e
  publicações; `@voce` como autor de novos comentários, conforme o protótipo).
- **Filtro de tag**: rótulo usado para restringir os projetos do feed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: As 7 telas estão acessíveis por endereço próprio e, comparadas lado a lado com os
  protótipos em 1440px e 360px, não apresentam diferenças de conteúdo, ordem dos elementos,
  cores ou tipografia além das registradas em Pendências.
- **SC-002**: 100% dos fluxos de navegação listados nas user stories levam à tela esperada.
- **SC-003**: 100% das interações dos protótipos (filtros, abas, busca, aprovar, comentar,
  respostas, seguir, tags, carregar imagem, publicar, descartar) funcionam e são concluídas
  apenas com teclado.
- **SC-004**: Nenhuma tela apresenta rolagem horizontal ou conteúdo cortado/sobreposto em
  larguras de 360px, 768px, 1024px e 1440px.
- **SC-005**: Todos os pares de cor de texto usados atingem contraste mínimo de 4.5:1 e todos
  os controles mostram foco visível.
- **SC-006**: Durante o uso das telas, nenhuma chamada à API do backend é registrada.
- **SC-007**: Uma pessoa que nunca viu o produto consegue, sem ajuda, encontrar um projeto por
  tag, comentar nele e publicar um novo projeto em menos de 3 minutos.

## Assumptions

- Os endereços seguem o HANDOFF: `/login`, `/cadastro`, `/` (Feed), `/publicar`,
  `/projeto/:id`, `/perfil/:handle` e `/sobre`. Não há proteção de rotas: sem autenticação,
  todas as telas são acessíveis diretamente.
- A pessoa logada de exemplo é `@julio`; "Perfil" no menu abre `/perfil/julio`. Todos os
  autores dos posts de exemplo têm perfil nos dados de exemplo (nome, inicial, conexões e seus
  projetos; bio só quando houver). `@voce`, autor dos comentários novos, não tem perfil: o link
  leva ao estado de perfil não encontrado.
- O detalhe de cada projeto usa os dados do próprio projeto; os comentários do protótipo de
  Detalhe pertencem ao projeto "Dashboard de vendas com React" e os demais projetos recebem
  comentários de exemplo curtos, em quantidade igual ao contador mostrado no card do protótipo.
  O contador de comentários conta só comentários de primeiro nível (respostas não contam).
- Nos dados de exemplo, a pessoa logada já aprovou "API de autenticação em Node" e "Lista de
  tarefas com Next.js e Prisma" (aba "Aprovados" do perfil); por isso esses cards aparecem com o
  estado aprovado no feed — diferença intencional em relação ao protótipo do Feed.
- Compartilhar exibe apenas o contador (o protótipo não define ação); o botão não navega nem
  abre diálogo nesta etapa.
- "Responder" é exibido nos comentários como no protótipo, mas não abre campo de resposta (o
  protótipo não define esse fluxo).
- A versão tablet (640–1023px, referência de 768px) usa a navegação horizontal com rótulos de
  22px e avatar de perfil de 208px, conforme `DESIGN.md` §5; o protótipo não tem tela tablet
  dedicada. O HANDOFF sugeria menu lateral já a partir de 768px; prevalece o `DESIGN.md`
  (divergência registrada nas Pendências).
- O trecho de código exibido nos cards é um marcador visual que representa a imagem do projeto;
  projetos publicados com imagem mostram a imagem carregada.
- A integração com o backend (autenticação, persistência, upload real) está fora do escopo e
  será especificada em feature própria.
- Testes automatizados de componente para a lógica de UI fazem parte da entrega, conforme a
  constituição (Princípio IV); a ferramenta de testes do frontend ainda precisa ser adicionada
  ao projeto.
