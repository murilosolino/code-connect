# DESIGN.md

Regras de design do **CodeConnect**, extraídas do Figma
([Guia de Estilos](https://www.figma.com/design/mqCVx69NBO7Hi8tyOeVosB/CodeConnect---Acervo---Fa%C3%A7a-uma-c%C3%B3pia---Community-?node-id=155-4078) e
[Componentes](https://www.figma.com/design/mqCVx69NBO7Hi8tyOeVosB/CodeConnect---Acervo---Fa%C3%A7a-uma-c%C3%B3pia---Community-?node-id=155-3845)).

Ao implementar UI no `frontend/` (React + Tailwind 4), use **sempre** os tokens abaixo em vez de valores soltos
(`slate-*`, hex avulso, tamanhos arbitrários). O tema é **escuro**, com verde como cor de destaque.

> Itens marcados com ⚠️ são lacunas ou inconsistências do Figma que precisam de confirmação (veja [Pendências](#pendências)).

---

## 1. Cores

| Token | Nome no Figma | Hex | Uso |
| --- | --- | --- | --- |
| `verde-destaque` | Verde destaque | `#81FE88` | Ação primária, links/abas ativos, foco, nome do perfil |
| `verde-pastel` | Verde pastel | `#BFFFC3` | Estado **hover** dos elementos verdes e do botão terciário |
| `verde-petroleo` | Verde petróleo | `#132E35` | Texto sobre o botão primário (fundo verde) |
| `grafite` | Grafite | `#00090E` | Texto de maior contraste (ex.: campo de senha preenchido) ⚠️ |
| `cinza-escuro` | Cinza escuro | `#171D1F` | Superfícies: cards, menus, search box; texto sobre fundos claros |
| `cinza` | Cinza | `#3E3E3F` | Apoio (divisores/bordas sutis) ⚠️ |
| `cinza-medio` | Cinza médio | `#888888` | Texto secundário, ícones, bordas inativas, fundo de input e tag |
| `cinza-claro` | Cinza claro | `#BCBCBC` | Texto de destaque em cards, hover de aba, tag de prévia |
| `offwhite` | Offwhite | `#E1E1E1` | Texto principal sobre fundo escuro (labels de formulário) |
| `branco` | Branco | `#FFFFFF` | Uso pontual |

Regras:

- Verde destaque `#81FE88` é a única cor de ação. O hover **clareia** para verde pastel `#BFFFC3`; nunca escurece.
- Texto sobre fundo escuro: `offwhite` (principal), `cinza-claro` (títulos de card), `cinza-medio` (secundário/inativo).
- Texto sobre fundos claros/médios (input, tag, comentário): `cinza-escuro` `#171D1F`.
- Fundo de cards, menus e search box é `cinza-escuro`. O fundo geral da página não está definido no Figma ⚠️.

---

## 2. Tipografia

Famílias:

- **Prompt** (Regular 400, Medium 500, SemiBold 600) — todo o texto da interface.
- **Roboto Mono** (Regular 400) — trechos de código (`Paragraph Código`, 15px).
- **Material Icons** (Regular) — todos os ícones, usados como ligadura de texto (`search`, `feed`, `logout`…).

Escala (letter-spacing `0` em todos):

| Estilo | Fonte | Tamanho | Peso | Line-height |
| --- | --- | --- | --- | --- |
| Heading | Prompt | 44px | 500 | 120% |
| Heading Small | Prompt | 37px | 500 | 120% |
| Subtitle Large | Prompt | 31px | 400 | 150% |
| Subtitle | Prompt | 26px | 400 | 150% |
| Subtitle Semibold | Prompt | 26px | 600 | 150% |
| Paragraph Large | Prompt | 22px | 400 | 150% |
| Paragraph Large Semibold | Prompt | 22px | 600 | 150% |
| Paragraph | Prompt | 18px | 400 | 150% |
| Paragraph Semibold | Prompt | 18px | 600 | 150% |
| Paragraph Small | Prompt | 15px | 400 | 150% |
| Paragraph Small Semibold | Prompt | 15px | 600 | 150% |
| Label | Prompt | 12.5px | 400 | 150% |
| Paragraph Código | Roboto Mono | 15px | 400 | 100% ⚠️ |

Regras: títulos usam peso 500, texto corrido 400 e ênfase/ação 600. Não crie tamanhos fora da escala.

---

## 3. Forma, espaçamento e elevação

- **Raio**: `8px` em containers grandes (cards, menus, botões, editor de código); `4px` em elementos pequenos (input, search box, tag, checkbox).
- **Espaçamento** (múltiplos de 4/8): `4`, `8`, `16`, `24`, `32`, `40`, `80`.
  - Padding de botão: `12px 16px`; de input/search/tag: `8px 16px` (tag: `4px 8px`).
  - Gap padrão entre ícone e texto: `8px`; entre itens de ação: `16px`; entre tags: `10px`.
  - Padding interno de cards e containers: `16px`.
- **Sombra** (`$editor-shadow`): `0 16px 24px 0 rgba(0,0,0,0.24)` — aplicada apenas ao editor de código dentro do card.
- **Bordas**: `1px` em botões secundário/terciário e foco do search; `2px` no checkbox.

---

## 4. Componentes

### Botões

Estrutura: `flex`, centralizado, `gap 8px`, `padding 12px 16px`, raio `8px`, texto Prompt **SemiBold** 18px, ícone Material Icons 24px à direita (ex.: `arrow_forward`, `upload`).

| Variante | Normal | Hover |
| --- | --- | --- |
| Primário | fundo `#81FE88`, texto `#132E35` | fundo `#BFFFC3`, texto `#132E35` |
| Secundário | borda 1px `#81FE88`, texto `#81FE88` | borda e texto `#BFFFC3` |
| Terciário | borda 1px `#888888`, texto `#888888` | borda e texto `#BFFFC3` |

Exemplos: Primário "Login →", Terciário "Carregar imagem ⬆", Terciário compacto "Seguir" (perfil), Secundário "Publicar" (menu, 22px Regular).

### Input (texto, senha, textarea)

- Coluna com `gap 8px`: **label** (Paragraph 18px, `#E1E1E1`) + **campo**.
- Campo: fundo `#888888`, raio `4px`, padding `8px 16px`, texto Paragraph Small 15px `#171D1F` (senha preenchida: `#00090E`).
- Textarea: mesma estrutura, altura `161px`.
- Variante de senha: abaixo do campo, checkbox "Lembrar-me" (15px, `#E1E1E1`) e link "Esqueci a senha" (15px, `#E1E1E1`, sublinhado).

### Search Box

- Fundo `#171D1F`, raio `4px`, padding `8px 16px`, `gap 16px`, ícone `search` + placeholder "Digite o que você procura".
- Desktop: ícone 32px, texto 22px, largura total. Mobile: ícone 24px, texto 15px.
- **Focus/hover**: borda 1px `#81FE88`. Cor do placeholder/ícone: `#BCBCBC` ⚠️ (inferido do Figma).

### Tag

- Padding `4px 8px`, raio `4px`, texto 18px `#171D1F` (mobile 15px).
- Padrão (removível): fundo `#888888` + ícone `close` 15px. Prévia (somente leitura): fundo `#BCBCBC`, sem ícone.
- Em cards, tags quebram linha (`flex-wrap`, `gap 10px`).

### Link

- Padrão `#888888`, 18px (mobile 15px). Hover: `#81FE88` + sublinhado. Exemplo: "Limpar tudo".

### Tab

- 22px, padding horizontal `4px`.
- Ativa: SemiBold, `#81FE88`, sublinhada. Inativa: Regular `#888888`. Hover: Regular `#BCBCBC`.

### Checkbox

- Caixa `24×24`, borda `2px #888888`, raio `4px`, padding `4px`; rótulo 15px `#888888`, `gap 8px`. Estado marcado existe no Figma (`Check`) ⚠️ não detalhado aqui.

### Card de publicação

- Duas partes empilhadas: **topo** (área do editor) e **corpo**.
- Topo: fundo `#848484` (feed: `#888888`), raio superior `8px`, padding `24px 16px` (feed: `24px`, altura `240px`); editor de código com raio `8px`, altura `320px` (feed: preenche) e sombra do editor.
- Corpo: fundo `#171D1F`, raio inferior `8px`, padding `16px`, `gap 16px`.
  - Título: Prompt SemiBold `#BCBCBC` — 22px na versão página, **18px no card do feed**.
  - Descrição: 15px `#BCBCBC`. Tags: ver acima.
  - Rodapé: ações à esquerda, autor à direita (`justify-between`).
- **Ações** (ícones Material 24px + contador 15px, `#888888`, `gap 16px`): `code` (aprovar), `share` (compartilhar), `chat` (comentar).
- **Card Feed**: largura máxima `486px`. **Card página**: `993px`.

### Usuário (avatar)

- Avatar redondo `32px` + `@handle` Prompt SemiBold `#888888`, `gap 8px`. Variantes: avatar+nome (15px), só nome 15px, só nome 22px.

### Comentários

- Avatar `32px` + `@usuario` (15px SemiBold) + texto (15px), `gap 8px`, cor `#171D1F`.
- Ações: "Responder" (15px SemiBold) e "Ver respostas"/"Ocultar respostas" (Label 12.5px) precedido de traço de `32px`.
- Respostas são recuadas `40px` à esquerda. Fundo do bloco de comentários não definido no Figma ⚠️ (texto escuro implica fundo claro).

### Menu desktop (lateral)

- Fundo `#171D1F`, raio `8px`, largura `177px` (máx. `282px`), padding `40px 16px`, coluna centralizada, `gap 80px` entre logo e navegação.
- Logo no topo (`127×40`), botão secundário "Publicar" e itens com `gap 40px`.
- Item: coluna, ícone 32px + rótulo 22px, `gap 8px`, padding `8px 16px`, cor `#888888`.
- Itens (logado): Feed (`feed`), Perfil (`account_circle`), Sobre nós (`info`), Sair (`logout`). Deslogado: variante própria.
- **Estados do item** (ícone + rótulo mudam juntos de cor):
  - Normal: `#888888`.
  - Hover: `#BFFFC3` (verde pastel).
  - Focus: `#FFFFFF` (branco).
  - Existem variantes de página ativa (Feed/Perfil/Sobre) no menu lateral ⚠️ ainda não lidas.

### Menu mobile / tablet

- Barra horizontal, fundo `#171D1F`, raio `8px`, itens `space-between`, ícone 32px.
- Tablet: largura `768px`, padding `40px 60px`, rótulo 22px. Mobile: largura `360px`, padding `24px 16px`, rótulo 18px.
- Logado: Feed, Perfil, Sobre nós, Sair. Deslogado: Feed, Sobre nós, **Login** (`login`).

### Perfil

- Avatar grande + informações lado a lado (desktop); empilhado em tablet/mobile. Padding `16px`, divisor ao final.
- Avatar: `254px` (desktop), `208px` (tablet), `160px` (mobile). `gap 24px` entre avatar e texto; `gap 40px` entre seções (mobile `24px`).
- `@handle` 22px SemiBold `#888888` + botão terciário "Seguir"; nome 26px SemiBold `#81FE88`; bio 18px `#888888`; estatísticas ("3 Projetos", "25 Conexões") 18px `#888888`, número em SemiBold, `gap 24px`.

---

## 5. Responsividade

Os componentes do Figma têm três versões, que definem os pontos de quebra de referência:

| Versão | Largura de referência | Navegação |
| --- | --- | --- |
| Desktop | ~995–1000px+ | Menu lateral |
| Tablet | 648–768px | Menu horizontal (rótulo 22px) |
| Mobile | 360px | Menu horizontal (rótulo 18px), search compacto, links/tags em 15px |

Em mobile reduza: ícone do search 32→24px, texto do search 22→15px, rótulos do menu 22→18px, avatar do perfil 254→160px.

---

## 6. Ativos

- **Logo** (`351×110` no guia; `127×40` no menu) e **Favicon** (48px e 64px) estão no Figma, na seção "Guia de Estilos"; baixe de lá — não redesenhe.
- Ícones: sempre Material Icons (nunca SVGs improvisados).

---

## 7. Como aplicar no projeto (Tailwind 4)

Hoje `frontend/src/index.css` só importa o Tailwind e `App.tsx` usa `slate-*`. Ao iniciar a implementação, declare os tokens em `index.css`:

```css
@import "tailwindcss";

@theme {
  --color-verde-destaque: #81fe88;
  --color-verde-pastel: #bfffc3;
  --color-verde-petroleo: #132e35;
  --color-grafite: #00090e;
  --color-cinza-escuro: #171d1f;
  --color-cinza: #3e3e3f;
  --color-cinza-medio: #888888;
  --color-cinza-claro: #bcbcbc;
  --color-offwhite: #e1e1e1;

  --font-sans: "Prompt", sans-serif;
  --font-mono: "Roboto Mono", monospace;

  --text-label: 12.5px;
  --text-paragraph-sm: 15px;
  --text-paragraph: 18px;
  --text-paragraph-lg: 22px;
  --text-subtitle: 26px;
  --text-subtitle-lg: 31px;
  --text-heading-sm: 37px;
  --text-heading: 44px;

  --shadow-editor: 0 16px 24px 0 rgb(0 0 0 / 0.24);
}
```

Carregue Prompt (400/500/600), Roboto Mono e Material Icons (ex.: Google Fonts) no `index.html`. Crie componentes React reutilizáveis (`Button`, `Input`, `Tag`, `Card`…) com as variantes acima em vez de repetir classes.

---

## Pendências

Inconsistências/lacunas do Figma para confirmar com design:

1. **Grafite**: a variável é `#00090E`, mas o texto da amostra no guia diz `#01080E`. Foi adotado `#00090E`.
2. **Cinza `#3E3E3F`**: aparece como token, mas o uso exato (divisores/bordas?) não ficou claro.
3. **Tags em cards**: no Figma o fundo e o texto aparecem ambos `#171D1F` (provável override de instância); o padrão adotado é o da tag (`#888888` / `#171D1F`).
4. **Topo do card** usa `#848484` na versão página e `#888888` no feed — diferença provavelmente acidental.
5. **Fundo da página** e **fundo dos comentários** não estão definidos nos nós analisados.
6. **Menu**: as variantes de página ativa "Feed/Perfil/Sobre/Deslogado" do menu lateral (nós 155:3923, 155:3940, 155:3957, 585:2641) ainda não foram lidas.
7. **Checkbox marcado** (`Check`) e **Paragraph Código** (line-height `100`) não foram detalhados.
   Definição provisória do checkbox marcado (spec `001-frontend-telas-prototipo`, FR-027): caixa
   `24×24`, raio `4px`, borda `2px` `#81FE88` e ícone `check` centralizado em `#81FE88`.
8. **Estado de erro dos campos** não existe no Figma. Definição provisória (spec
   `001-frontend-telas-prototipo`, FR-026), só com tokens existentes: campo com borda interna
   `2px` `#FFFFFF` (contraste 3.5:1 sobre `#888888`), mantendo fundo e altura; `8px` abaixo,
   ícone `error` 15px + mensagem Paragraph Small 15px `#E1E1E1`, `gap 8px`. Não há cor de erro
   (vermelho) no design system; confirmar com design.
9. **Estados vazios e "não encontrado"** não existem no Figma. Definição provisória (spec
   `001-frontend-telas-prototipo`, FR-029): superfície `#171D1F`, raio `8px`, padding `24px`,
   ícone Material 32px `#888888`, título Paragraph Large Semibold `#BCBCBC`, texto Paragraph
   Small `#888888` e, quando houver, botão secundário "Voltar ao feed".
10. **Link "Pular para o conteúdo"** não existe no Figma. Definição provisória (FR-030): oculto
    até receber foco; focado, aparece no canto superior esquerdo com o visual do botão primário.
11. **Ponto de quebra do menu**: o HANDOFF dos protótipos usa menu lateral a partir de 768px, mas
    este documento (§5) define o tablet com referência de 768px e menu horizontal. Prevalece este
    documento: menu lateral a partir de 1024px; barra horizontal abaixo (rótulo 22px de 640px a
    1023px, 18px abaixo de 640px); avatar do perfil 160 / 208 / 254px nas mesmas faixas.
