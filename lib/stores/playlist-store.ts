import { create } from 'zustand'
import { createClientSupabaseClient } from '@/lib/supabase'
import type { Playlist, Song } from '@/lib/types'

interface PlaylistStore {
  playlists: Playlist[]
  currentPlaylist: Playlist | null
  songs: Song[]
  currentSongIndex: number | null
  isLoading: boolean
  error: string | null
  fetchPlaylists: () => Promise<void>
  fetchPlaylistDetails: (id: string | number) => Promise<void>
  setCurrentSongIndex: (index: number | null) => void
  playNextSong: () => void
  playPreviousSong: () => void
}

const usePlaylistStore = create<PlaylistStore>((set, get) => ({
  playlists: [],
  currentPlaylist: null,
  songs: [],
  currentSongIndex: null,
  isLoading: false,
  error: null,

  fetchPlaylists: async () => {
    set({ isLoading: true, error: null })
    const supabase = createClientSupabaseClient()

    try {
      const { data: playlistsData, error: playlistsError } = await supabase
        .from("playlists")
        .select(`
          id,
          youtube_playlist_id,
          title,
          description
        `)
        .returns<{ id: number; youtube_playlist_id: string; title: string; description: string | null }[]>()

      if (playlistsError) throw playlistsError

      // Process each playlist to get additional data
      const processedPlaylists = await Promise.all(
        (playlistsData || []).map(async (playlist) => {
          const { data: songs } = await supabase
            .from("songs")
            .select("id, thumbnail_url")
            .eq("playlist_id", playlist.id)
            .returns<{ id: number; thumbnail_url: string | null }[]>()

          const { data: ratings } = await supabase
            .from("playlist_ratings")
            .select("rating")
            .eq("playlist_id", playlist.id)
            .returns<{ rating: number }[]>()

          let averageRating = undefined
          if (ratings && ratings.length > 0) {
            const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0)
            averageRating = sum / ratings.length
          }

          return {
            id: playlist.id,
            youtubeId: playlist.youtube_playlist_id,
            title: playlist.title,
            description: playlist.description,
            thumbnailUrl: songs?.[0]?.thumbnail_url,
            songCount: songs?.length || 0,
            averageRating,
          }
        })
      )

      set({ playlists: processedPlaylists, isLoading: false })
    } catch (error) {
      console.error("Error fetching playlists:", error)
      set({ error: "Failed to fetch playlists", isLoading: false })
    }
  },

  fetchPlaylistDetails: async (id: string | number) => {
    set({ isLoading: true, error: null })
    const supabase = createClientSupabaseClient()

    try {
      // Ensure we have a valid numeric ID
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id
      if (isNaN(numericId)) {
        throw new Error('Invalid playlist ID')
      }

      const { data: playlistData, error: playlistError } = await supabase
        .from("playlists")
        .select("*")
        .eq("id", numericId)
        .single()
        .returns<{ id: number; youtube_playlist_id: string; title: string; description: string | null }>()

      if (playlistError) throw playlistError

      const { data: ratingsData } = await supabase
        .from("playlist_ratings")
        .select("rating")
        .eq("playlist_id", id)
        .returns<{ rating: number }[]>()

      let averageRating = undefined
      if (ratingsData && ratingsData.length > 0) {
        const sum = ratingsData.reduce((acc, curr) => acc + curr.rating, 0)
        averageRating = sum / ratingsData.length
      }

      const { data: songsData, error: songsError } = await supabase
        .from("songs")
        .select(`
          id,
          youtube_video_id,
          title,
          artist,
          thumbnail_url,
          duration
        `)
        .eq("playlist_id", id)
        .order("id", { ascending: true })
        .returns<Song[]>()

      if (songsError) throw songsError

      const playlist: Playlist = {
        id: playlistData.id,
        youtubeId: playlistData.youtube_playlist_id,
        title: playlistData.title,
        description: playlistData.description,
        averageRating,
        total_ratings: ratingsData?.length || 0,
        songCount: songsData?.length || 0
      }

      set({ 
        currentPlaylist: playlist,
        songs: songsData || [],
        isLoading: false
      })
    } catch (error) {
      console.error("Error fetching playlist details:", error)
      set({ error: "Failed to load playlist", isLoading: false })
    }
  },

  setCurrentSongIndex: (index: number | null) => {
    // Validate the index is within bounds
    const { songs } = get()
    if (index !== null && (index < 0 || index >= songs.length)) {
      return
    }
    set({ currentSongIndex: index })
  },

  playNextSong: () => {
    const { currentSongIndex, songs } = get()
    if (currentSongIndex !== null && currentSongIndex < songs.length - 1) {
      set({ currentSongIndex: currentSongIndex + 1 })
    }
  },

  playPreviousSong: () => {
    const { currentSongIndex } = get()
    if (currentSongIndex !== null && currentSongIndex > 0) {
      set({ currentSongIndex: currentSongIndex - 1 })
    }
  }
}))

export { usePlaylistStore as default }