# Contrato da camada de dados (frontend)

A **única** porta entre as telas e os dados. Hoje é implementada em memória sobre o seed; na
integração com o backend, a implementação destes hooks muda (passa a chamar `/api/...`) e as
telas não mudam. Telas e componentes **não** importam `src/data/seed.ts` diretamente.

Tipos: ver [data-model.md](../data-model.md).

## Provider

```ts
<AppDataProvider initialState?: AppState>  // padrão: estado criado a partir do seed
```

`initialState` existe para os testes montarem cenários específicos sem tocar no seed.

## Leitura (hooks)

| Hook | Retorno | Observação |
| --- | --- | --- |
| `usePosts()` | `PostView[]` | Todos os posts na ordem "Recentes", já com `commentCount`, `approvedByViewer` e `author: User`. |
| `usePost(id)` | `PostView \| undefined` | `undefined` → tela de projeto não encontrado. |
| `useComments(postId)` | `Comment[]` | Ordem de exibição. |
| `useUser(handle)` | `UserView \| undefined` | Com `projectsCount`, `connectionsDisplayed` e `followedByViewer`. |
| `useUserPosts(handle)` | `{ projects: PostView[]; approved: PostView[] }` | `approved` só é preenchido para a pessoa logada (fonte: `viewer.approvedPostIds`). |
| `useViewer()` | `{ handle: string }` | Pessoa logada de exemplo. |

`PostView = Post & { author: User; commentCount: number; approvedByViewer: boolean }`

## Escrita (ações)

`useAppActions()` devolve:

| Ação | Assinatura | Contrato |
| --- | --- | --- |
| `toggleApproval` | `(postId: string) => void` | Alterna aprovação e contador (±1). |
| `addComment` | `(postId: string, text: string) => boolean` | `false` e nada muda se `text.trim()` vazio. |
| `toggleFollow` | `(handle: string) => void` | Alterna "Seguir/Seguindo". |
| `publishPost` | `(input: { title: string; description: string; tags: string[]; imageUrl?: string }) => string` | Devolve o `id` do novo post (inserido no início). Pressupõe entrada já validada pela tela. |

## Garantias

- Síncrono e sem rede: nenhuma ação ou hook chama `fetch` nesta etapa (SC-006).
- Recarregar a página recria o estado a partir do seed (FR-004).
- Reducer e seletores são funções puras exportadas (`appReducer`, `selectPostView`…) e têm testes
  de unidade próprios.
