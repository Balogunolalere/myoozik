"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClientSupabaseClient } from "@/lib/supabase"
import { extractPlaylistId } from "@/lib/youtube"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Music } from "lucide-react"
import { motion } from "framer-motion"

export function PlaylistForm() {
  const [playlistUrl, setPlaylistUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClientSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setError(null)

    const playlistId = extractPlaylistId(playlistUrl)

    if (!playlistId) {
      setError("Invalid YouTube playlist URL. Please enter a valid URL.")
      return
    }

    setIsSubmitting(true)

    try {
      // Check if playlist already exists
      const { data: existingPlaylists } = await supabase
        .from("playlists")
        .select("id")
        .eq("youtube_playlist_id", playlistId)
        .limit(1)

      if (existingPlaylists && existingPlaylists.length > 0) {
        router.push(`/playlist/${existingPlaylists[0].id}`)
        return
      }

      // Fetch playlist data from YouTube API
      const response = await fetch(`/api/youtube/playlist?id=${playlistId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch playlist data")
      }

      const playlistData = await response.json()

      // Insert playlist into database
      const { data: playlistInsert, error: playlistError } = await supabase
        .from("playlists")
        .insert([
          {
            youtube_playlist_id: playlistId,
            title: playlistData.title,
            description: playlistData.description || null,
          },
        ])
        .select()

      if (playlistError) throw playlistError

      const newPlaylistId = playlistInsert[0].id

      // Insert songs into database
      const songsToInsert = playlistData.videos.map((video: any) => ({
        playlist_id: newPlaylistId,
        youtube_video_id: video.id,
        title: video.title,
        artist: video.artist || null,
        thumbnail_url: video.thumbnailUrl,
        duration: video.duration,
      }))

      const { error: songsError } = await supabase.from("songs").insert(songsToInsert)

      if (songsError) throw songsError

      // Redirect to the new playlist page
      router.push(`/playlist/${newPlaylistId}`)
    } catch (err) {
      console.error("Error adding playlist:", err)
      setError("Failed to add playlist. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      className="neobrutalist-container w-full max-w-2xl mx-auto relative overflow-hidden bg-[#FD6C6C]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "var(--font-marker)" }}>
        Add YouTube Playlist
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="playlist-url" className="block font-bold mb-2" style={{ fontFamily: "var(--font-indie)" }}>
            YouTube Playlist URL
          </label>
          <Input
            id="playlist-url"
            type="text"
            placeholder="https://www.youtube.com/playlist?list=..."
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            className="neobrutalist-input"
            required
          />
        </div>

        {error && (
          <motion.div
            className="bg-red-100 border-4 border-red-500 p-3 text-red-700"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button type="submit" disabled={isSubmitting || !playlistUrl.trim()} className="neobrutalist-button">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding Playlist...
              </>
            ) : (
              "Add Playlist"
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  )
}

