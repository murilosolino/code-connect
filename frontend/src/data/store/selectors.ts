import type { AppState, Post, PostView, UserView } from '../types'

function toPostView(state: AppState, post: Post): PostView {
  return {
    ...post,
    author: state.users[post.authorHandle],
    commentCount: state.comments[post.id]?.length ?? 0,
    approvedByViewer: state.viewer.approvedPostIds.includes(post.id),
  }
}

export function selectPostViews(state: AppState): PostView[] {
  return state.posts.map((post) => toPostView(state, post))
}

export function selectPostView(state: AppState, id: string): PostView | undefined {
  const post = state.posts.find((item) => item.id === id)
  return post ? toPostView(state, post) : undefined
}

export function selectUserView(state: AppState, handle: string): UserView | undefined {
  const user = state.users[handle]
  if (!user) return undefined
  const followedByViewer = state.viewer.followingHandles.includes(handle)
  return {
    ...user,
    projectsCount: state.posts.filter((post) => post.authorHandle === handle).length,
    connectionsDisplayed: user.connections + (followedByViewer ? 1 : 0),
    followedByViewer,
  }
}

/** Projetos da pessoa e, só para a pessoa logada, os de outras pessoas que ela aprovou. */
export function selectUserPosts(
  state: AppState,
  handle: string,
): { projects: PostView[]; approved: PostView[] } {
  const views = selectPostViews(state)
  return {
    projects: views.filter((post) => post.authorHandle === handle),
    approved:
      handle === state.viewer.handle
        ? views.filter((post) => post.approvedByViewer && post.authorHandle !== handle)
        : [],
  }
}
