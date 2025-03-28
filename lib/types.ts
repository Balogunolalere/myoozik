export interface Playlist {
  id: number
  youtubeId: string
  title: string
  description: string | null
  thumbnailUrl?: string | null
  songCount: number
  averageRating?: number
  total_ratings?: number
}

export interface Song {
  id: number
  youtube_video_id: string
  title: string
  artist?: string
  thumbnail_url?: string
  duration?: string
}

export interface Comment {
  id: number
  content: string
  nickname: string
  created_at: string
}