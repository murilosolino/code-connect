import type { AppState, AuthViewer, Comment, Post } from '../types'

export type PublishInput = {
  title: string
  description: string
  tags: string[]
  imageUrl?: string
}

export type AppAction =
  | { type: 'toggleApproval'; postId: string }
  | { type: 'addComment'; postId: string; text: string }
  | { type: 'toggleFollow'; handle: string }
  | { type: 'publishPost'; input: PublishInput }
  | { type: 'setViewer'; viewer: AuthViewer }
  | { type: 'clearViewer' }

/** Id que o próximo projeto publicado vai receber. */
export const nextPostId = (state: AppState): string => `novo-${state.nextId}`

const toggle = (list: string[], value: string): string[] =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value]

/** Reducer puro e imutável: o estado anterior nunca é alterado. */
export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'toggleApproval': {
      const target = state.posts.find((post) => post.id === action.postId)
      if (!target || !state.viewer.handle) return state
      const approved = state.viewer.approvedPostIds.includes(action.postId)
      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === action.postId
            ? { ...post, approvals: post.approvals + (approved ? -1 : 1) }
            : post,
        ),
        viewer: {
          ...state.viewer,
          approvedPostIds: toggle(state.viewer.approvedPostIds, action.postId),
        },
      }
    }

    case 'addComment': {
      const text = action.text.trim()
      const existing = state.comments[action.postId]
      const author = state.users[state.viewer.handle]
      if (!text || !existing || !author) return state
      const comment: Comment = {
        id: `${action.postId}-c${existing.length + 1}`,
        postId: action.postId,
        authorHandle: author.handle,
        authorInitials: author.initials,
        text,
        replies: [],
      }
      return {
        ...state,
        comments: { ...state.comments, [action.postId]: [...existing, comment] },
      }
    }

    case 'toggleFollow':
      if (!state.viewer.handle) return state
      return {
        ...state,
        viewer: {
          ...state.viewer,
          followingHandles: toggle(state.viewer.followingHandles, action.handle),
        },
      }

    case 'publishPost': {
      const { title, description, tags, imageUrl } = action.input
      const id = nextPostId(state)
      const post: Post = {
        id,
        title: title.trim(),
        summary: description.trim(),
        description: description.trim(),
        tags: [...tags],
        ...(imageUrl ? { imageUrl } : {}),
        authorHandle: state.viewer.handle,
        approvals: 0,
        shares: 0,
      }
      return {
        ...state,
        posts: [post, ...state.posts],
        comments: { ...state.comments, [id]: [] },
        nextId: state.nextId + 1,
      }
    }

    // A pessoa que entra pela API passa a existir no store; as escolhas (aprovações e seguidos)
    // ainda são em memória e recomeçam a cada pessoa.
    case 'setViewer': {
      const { handle, name, initials, avatarUrl } = action.viewer
      const known = state.users[handle]
      if (state.viewer.handle === handle && known) return state
      return {
        ...state,
        users: known
          ? state.users
          : {
              ...state.users,
              [handle]: { handle, name, initials, ...(avatarUrl ? { avatarUrl } : {}), connections: 0 },
            },
        viewer: { handle, approvedPostIds: [], followingHandles: [] },
      }
    }

    case 'clearViewer':
      if (!state.viewer.handle) return state
      return { ...state, viewer: { handle: '', approvedPostIds: [], followingHandles: [] } }
  }
}
