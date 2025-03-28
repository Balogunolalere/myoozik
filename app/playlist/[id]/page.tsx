"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SongCard } from "@/components/song-card"
import { YouTubePlayer } from "@/components/youtube-player"
import { PlaylistRating } from "@/components/playlist-rating"
import { PlaylistCommentSection } from "@/components/playlist-comment-section"
import { createClientSupabaseClient } from "@/lib/supabase"
import { motion, AnimatePresence } from "framer-motion"

interface PlaylistPageProps {
  params: {
    id: string
  }
}

interface Song {
  id: number
  youtube_video_id: string
  title: string
  artist?: string
  thumbnail_url?: string
  duration?: string
}

interface Playlist {
  id: number
  youtube_playlist_id: string
  title: string
  description: string | null
  average_rating?: number
  total_ratings?: number
}

export default function PlaylistPage({ params }: PlaylistPageProps) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  const supabase = createClientSupabaseClient()

  useEffect(() => {
    setIsMounted(true)
    fetchPlaylistData()
  }, [params.id])

  const fetchPlaylistData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch playlist details
      const { data: playlistData, error: playlistError } = await supabase
        .from("playlists")
        .select("*")
        .eq("id", params.id)
        .single()
        .returns<{ id: number; youtube_playlist_id: string; title: string; description: string | null }>()

      if (playlistError) throw playlistError

      // Fetch playlist ratings
      const { data: ratingsData, error: ratingsError } = await supabase
        .from("playlist_ratings")
        .select("rating")
        .eq("playlist_id", params.id)
        .returns<{ rating: number }[]>()

      if (ratingsError) throw ratingsError

      let averageRating = undefined
      if (ratingsData && ratingsData.length > 0) {
        const sum = ratingsData.reduce((acc, curr) => acc + curr.rating, 0)
        averageRating = sum / ratingsData.length
      }

      const playlist: Playlist = {
        id: playlistData.id,
        youtube_playlist_id: playlistData.youtube_playlist_id,
        title: playlistData.title,
        description: playlistData.description,
        average_rating: averageRating,
        total_ratings: ratingsData ? ratingsData.length : 0
      }

      setPlaylist(playlist)

      // Fetch songs
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
        .eq("playlist_id", params.id)
        .order("id", { ascending: true })
        .returns<Song[]>()

      if (songsError) throw songsError

      setSongs(songsData || [])
    } catch (err) {
      console.error("Error fetching playlist data:", err)
      setError("Failed to load playlist. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlaySong = (index: number) => {
    setCurrentSongIndex(index)
  }

  const handleSongEnded = () => {
    if (currentSongIndex !== null && currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1)
    }
  }

  const handleNextSong = () => {
    if (currentSongIndex !== null && currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1)
    }
  }

  const handlePreviousSong = () => {
    if (currentSongIndex !== null && currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1)
    }
  }

  const handleRatingSubmit = async (rating: number) => {
    // Refresh playlist data to update the rating
    fetchPlaylistData()
  }

  const currentSong = currentSongIndex !== null ? songs[currentSongIndex] : null

  return (
    <div className="flex flex-col min-h-screen bg-amber-50">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-16 w-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <motion.div
            className="neobrutalist-container bg-red-100 text-red-700 text-center py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xl">{error}</p>
          </motion.div>
        ) : (
          <>
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="neobrutalist-container bg-[#FD6C6C] relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                    <div className="text-container">
                      <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-marker)" }}>
                        {playlist?.title}
                      </h1>
                      {playlist?.description && (
                        <p className="text-gray-800 mb-4" style={{ fontFamily: "var(--font-indie)" }}>
                          {playlist.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 bg-white/70 p-4 rounded-lg backdrop-blur-sm border-2 border-black">
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-marker)" }}>
                      Rate this playlist
                    </h3>
                    <PlaylistRating
                      playlistId={Number.parseInt(params.id)}
                      initialRating={0}
                      totalRatings={playlist?.total_ratings || 0}
                      averageRating={playlist?.average_rating || 0}
                      onRatingSubmit={handleRatingSubmit}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {currentSong && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-marker)" }}>
                  Now Playing
                </h2>
                <YouTubePlayer
                  videoId={currentSong.youtube_video_id}
                  onEnded={handleSongEnded}
                  autoplay={true}
                  onNext={handleNextSong}
                  onPrevious={handlePreviousSong}
                  hasNext={currentSongIndex !== null && currentSongIndex < songs.length - 1}
                  hasPrevious={currentSongIndex !== null && currentSongIndex > 0}
                />
              </motion.div>
            )}

            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "var(--font-marker)" }}>
                Songs in Playlist
              </h2>

              <div className="grid gap-4">
                <AnimatePresence>
                  {songs.map((song, index) => (
                    <motion.div
                      key={song.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <SongCard
                        id={song.id}
                        youtubeId={song.youtube_video_id}
                        title={song.title}
                        artist={song.artist}
                        thumbnailUrl={song.thumbnail_url}
                        duration={song.duration}
                        onPlay={() => handlePlaySong(index)}
                        isPlaying={currentSongIndex === index}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <PlaylistCommentSection playlistId={Number.parseInt(params.id)} />
            </motion.div>
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

