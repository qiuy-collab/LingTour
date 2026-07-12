// ============================================
// Community post types
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
  featured: boolean
  reviewedBy: string | null
  reviewedAt: string | null
  rejectionReason: string | null
  deletedAt: string | null
}

// Display labels for channels and statuses
export const PostChannelMap: Record<PostChannel, string> = {
  FieldNotes: 'Field Notes',
  FoodMap: 'Food Map',
  HiddenStop: 'Hidden Stop',
  CultureDesk: 'Culture Desk',
}

export const PostChannelColorMap: Record<PostChannel, string> = {
  FieldNotes: '',
  FoodMap: 'warning',
  HiddenStop: 'success',
  CultureDesk: 'primary',
}

export const PostStatusMap: Record<PostStatus, string> = {
  published: 'Published',
  pending_review: 'Pending review',
  hidden: 'Hidden',
}

export const PostStatusColorMap: Record<PostStatus, string> = {
  published: 'success',
  pending_review: 'warning',
  hidden: 'info',
}
