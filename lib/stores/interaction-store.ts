import { create } from 'zustand'
import { createClientSupabaseClient } from '@/lib/supabase'
import type { Comment } from '@/lib/types'

interface InteractionStore {
  comments: Comment[]
  hasRated: boolean
  isSubmittingRating: boolean
  isSubmittingComment: boolean
  isLoadingComments: boolean
  error: string | null
  
  fetchComments: (playlistId: number) => Promise<void>
  submitRating: (playlistId: number, rating: number) => Promise<void>
  submitComment: (playlistId: number, content: string, nickname: string) => Promise<void>
  checkIfRated: (playlistId: number) => Promise<void>
  reset: () => void
}

const useInteractionStore = create<InteractionStore>((set, get) => ({
  comments: [],
  hasRated: false,
  isSubmittingRating: false,
  isSubmittingComment: false,
  isLoadingComments: false,
  error: null,

  fetchComments: async (playlistId: number) => {
    set({ isLoadingComments: true, error: null })
    const supabase = createClientSupabaseClient()

    try {
      const { data, error } = await supabase
        .from("playlist_comments")
        .select("*")
        .eq("playlist_id", playlistId)
        .order("created_at", { ascending: false })
        .returns<Comment[]>()

      if (error) throw error

      set({ 
        comments: data || [],
        isLoadingComments: false 
      })
    } catch (error) {
      console.error("Error fetching comments:", error)
      set({ error: "Failed to load comments", isLoadingComments: false })
    }
  },

  submitRating: async (playlistId: number, rating: number) => {
    set({ isSubmittingRating: true, error: null })

    try {
      const response = await fetch("/api/ratings/playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playlistId, rating }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        if (data.error === "already_rated") {
          set({ hasRated: true, error: "You have already rated this playlist", isSubmittingRating: false })
          return
        }
        throw new Error(data.error || "Failed to submit rating")
      }

      set({ hasRated: true, isSubmittingRating: false })
    } catch (error) {
      console.error("Error submitting rating:", error)
      set({ error: "Failed to submit rating", isSubmittingRating: false })
    }
  },

  submitComment: async (playlistId: number, content: string, nickname: string) => {
    set({ isSubmittingComment: true, error: null })
    const supabase = createClientSupabaseClient()

    try {
      const { error } = await supabase
        .from("playlist_comments")
        .insert([{
          playlist_id: playlistId,
          content: content.trim(),
          nickname: nickname.trim() || "Anonymous",
        }])

      if (error) throw error

      // Refresh comments after submission
      get().fetchComments(playlistId)
      set({ isSubmittingComment: false })
    } catch (error) {
      console.error("Error submitting comment:", error)
      set({ error: "Failed to post comment", isSubmittingComment: false })
    }
  },

  checkIfRated: async (playlistId: number) => {
    const supabase = createClientSupabaseClient()
    
    try {
      const { data } = await supabase
        .from("playlist_ratings")
        .select("rating")
        .eq("playlist_id", playlistId)
        .is("ip_address", null)
        .maybeSingle()
        .returns<{ rating: number } | null>()

      set({ hasRated: !!data?.rating })
    } catch (error) {
      console.error("Error checking rating status:", error)
    }
  },

  reset: () => set({
    comments: [],
    hasRated: false,
    isSubmittingRating: false,
    isSubmittingComment: false,
    isLoadingComments: false,
    error: null
  })
}))

export { useInteractionStore as default }