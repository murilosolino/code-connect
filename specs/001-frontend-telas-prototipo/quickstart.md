# Quickstart — validar as telas do frontend

Guia para rodar e validar a feature de ponta a ponta. Detalhes de rotas, componentes e dados em
[contracts/](./contracts/) e [data-model.md](./data-model.md).

## Pré-requisitos

- Docker e Docker Compose; `make` disponível.
- Hooks instalados: `make hooks-install`.
- Branch da feature criada a partir da `master` (ex.: `feat/frontend-telas-prototipo`).

## Subir o ambiente

```bash
make up
```

Frontend em http://localhost:5173. Depois de mudar `package.json` (novas dependências), recrie o
volume de `node_modules` do frontend com `make build` seguido de `make up`.

## Gates automatizados

```bash
make frontend-lint
```

```bash
make frontend-test
```

```bash
make backend-test
```

Esperado: os três sem erro. `frontend-test` roda os testes de componente/unidade (Vitest).
`backend-test` não é afetado por esta feature, mas é gate de merge.

```bash
make prod-build
```

Esperado: build de produção concluído (o `tsc -b` também verifica os arquivos de teste).

## Roteiro manual (1440px e 360px; repetir o essencial em 768px e 1024px)

Pontos de quebra (`DESIGN.md` §5): menu lateral a partir de 1024px; barra horizontal abaixo,
com rótulos de 22px entre 640px e 1023px e de 18px abaixo de 640px.

Use o modo responsivo do navegador. Em cada tela, navegue também só com teclado (Tab,
Shift+Tab, Enter, Espaço, setas nas abas) e confirme o foco visível.

1. **Feed (`/`)** — filtros iniciais aplicados e só projetos com React/Acessibilidade/Front-end;
   remover um filtro e "Limpar tudo" → "Nenhum filtro aplicado." → "Restaurar filtros"; buscar
   "autenticacao" (sem acento) encontra "API de autenticação em Node" depois de limpar os filtros;
   busca sem resultado mostra o estado vazio; aba "Populares" ordena por aprovações; grade com 2
   colunas em 1440px e 1 coluna em 1024px ou menos.
2. **Menu** — cada item navega e fica destacado; em `/projeto/vendas` o item ativo é "Feed";
   abaixo de 1024px o menu vira barra horizontal sem rolagem lateral; "Pular para o conteúdo"
   aparece ao dar o primeiro Tab.
3. **Detalhe (`/projeto/vendas`)** — aprovar soma 1 e marca o botão; desfazer volta; o primeiro
   comentário abre com respostas; "Ver respostas" no segundo; comentar com Enter adiciona
   `@voce` ao fim e o contador vai de 3 para 4; comentário vazio não entra; voltar ao feed e ver
   o card com 4 comentários e o estado de aprovação mantidos.
4. **Publicar (`/publicar`)** — "Publicar" vazio mostra erros em "Nome do projeto" e
   "Descrição" com foco no primeiro; carregar PDF ou imagem > 5 MB mostra erro; carregar PNG
   mostra prévia e "Trocar imagem"; adicionar tag repetida não duplica; publicar abre
   `/projeto/novo-1` com os dados; no feed, depois de "Limpar tudo" (ou se o projeto tiver uma
   das tags dos filtros iniciais), ele aparece no topo de "Recentes" (FR-014).
5. **Perfil (`/perfil/julio`)** — "Seguir" ↔ "Seguindo" e Conexões 25 ↔ 26; abas Projetos (3,
   ou mais se publicou) e Aprovados; a busca (só a partir de 1024px) filtra a aba ativa; a aba
   Aprovados de `/perfil/ana.souza` mostra "Nenhum projeto aprovado ainda."; `/perfil/ninguem`
   mostra "Perfil não encontrado".
6. **Login (`/login`) e Cadastro (`/cadastro`)** — enviar vazio mostra erros (estado de erro de
   FR-026) e não navega; email inválido no Cadastro mostra "Digite um email válido."; corrigir o
   campo remove o erro; "Lembrar-me" marca/desmarca com Espaço; GitHub/Google vão ao feed; links
   alternam entre as telas.
7. **Sobre nós (`/sobre`)** — seções e "Publicar um projeto" levando a `/publicar`.
8. **Sem backend** — com a aba Rede do DevTools aberta, percorrer todas as telas: nenhuma
   requisição para `/api/` (SC-006). Recarregar a página volta aos dados de exemplo (FR-004).
9. **Rotas** — recarregar em `/projeto/auth` abre o detalhe; `/qualquer-coisa` mostra página não
   encontrada.

## Revisão de design (gate 3 do PR)

Comparar cada tela com `codeconnect-design/telas/<Tela>.dc.html` (1440px) e
`<Tela>-mobile.dc.html` (360px). Diferenças intencionais já conhecidas: o feed filtra pelos
filtros iniciais; cards de "API de autenticação" e "Lista de tarefas" já aprovados pela pessoa
logada; estado de erro, checkbox marcado, estados vazios, skip link e menu lateral só a partir
de 1024px (Pendências 7 a 11 do `DESIGN.md`).
