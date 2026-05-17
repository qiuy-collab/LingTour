// ============================================
// 社区帖子管理 TypeScript 类型定义
// ============================================

export type PostChannel = 'FieldNotes' | 'FoodMap' | 'HiddenStop' | 'CultureDesk'
export type PostStatus = 'published' | 'pending_review' | 'hidden'

export interface CommunityPost {
  id: string
  userName: string
  userHandle: string
  userAvatar: string
  image: string
  title: string
  excerpt: string
  content: string
  location: string
  route: string
  date: string
  channel: PostChannel
  mood: string
  tags: string[]
  likes: number
  comments: number
  saves: number
  status: PostStatus
}

// ─── 状态/频道显示映射 ──────────────────────────────
export const PostChannelMap: Record<PostChannel, string> = {
  FieldNotes: '田野笔记',
  FoodMap: '美食地图',
  HiddenStop: '秘境停靠',
  CultureDesk: '文化台',
}

export const PostChannelColorMap: Record<PostChannel, string> = {
  FieldNotes: '',
  FoodMap: 'warning',
  HiddenStop: 'success',
  CultureDesk: 'primary',
}

export const PostStatusMap: Record<PostStatus, string> = {
  published: '已发布',
  pending_review: '待审核',
  hidden: '已隐藏',
}

export const PostStatusColorMap: Record<PostStatus, string> = {
  published: 'success',
  pending_review: 'warning',
  hidden: 'info',
}
