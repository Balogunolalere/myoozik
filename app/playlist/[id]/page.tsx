"use client"

import { useEffect } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SongCard } from "@/components/song-card"
import { YouTubePlayer } from "@/components/youtube-player"
import { PlaylistRating } from "@/components/playlist-rating"
import { PlaylistCommentSection } from "@/components/playlist-comment-section"
import { VinylSpinner } from "@/components/vinyl-spinner"
import { motion, AnimatePresence } from "framer-motion"
import usePlaylistStore from "@/lib/stores/playlist-store"
import useInteractionStore from "@/lib/stores/interaction-store"
import type { Song } from "@/lib/types"

interface PageProps {
  params: {
    id: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function PlaylistPage({ params, searchParams }: PageProps) {
  const playlistId = params.id
  const { currentPlaylist, songs, currentSongIndex, isLoading, error, fetchPlaylistDetails, setCurrentSongIndex } = usePlaylistStore()
  const { reset } = useInteractionStore()

  useEffect(() => {
    const loadPlaylist = async () => {
      await fetchPlaylistDetails(playlistId)
    }
    loadPlaylist()
    return () => reset()
  }, [playlistId, fetchPlaylistDetails, reset])

  const handlePlaySong = (index: number) => {
    setCurrentSongIndex(index)
  }

  const handleStopSong = () => {
    setCurrentSongIndex(null)
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

  const handleRatingSubmit = async () => {
    await fetchPlaylistDetails(playlistId)
  }

  const currentSong = currentSongIndex !== null ? songs[currentSongIndex] : null

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex justify-center items-center py-20">
            <VinylSpinner size={64} />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
          <div className="neobrutalist-container bg-red-100 text-center py-12">
            <p className="text-xl text-red-600 mb-4">{error}</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button onClick={() => fetchPlaylistDetails(playlistId)} className="neobrutalist-button">
                Try Again
              </button>
            </motion.div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <>
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="neobrutalist-container bg-gradient-to-br from-[#FD6C6C] to-[#FFB199] relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                  <div className="text-container">
                    <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-marker)" }}>
                      {currentPlaylist?.title}
                    </h1>
                    {currentPlaylist?.description && (
                      <p className="text-gray-800 mb-4" style={{ fontFamily: "var(--font-indie)" }}>
                        {currentPlaylist.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 bg-white/70 p-4 rounded-lg backdrop-blur-sm border-2 border-black">
                  <div className="flex flex-col items-center">
                    <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-marker)" }}>
                      Rate this playlist
                    </h3>
                    <PlaylistRating
                      playlistId={Number.parseInt(playlistId)}
                      initialRating={0}
                      totalRatings={currentPlaylist?.total_ratings || 0}
                      averageRating={currentPlaylist?.averageRating || 0}
                      onRatingSubmit={handleRatingSubmit}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Hidden YouTubePlayer for audio playback */}
          {currentSong && (
            <YouTubePlayer
              videoId={currentSong.youtube_video_id}
              onEnded={handleSongEnded}
              autoplay={true}
              onNext={handleNextSong}
              onPrevious={handlePreviousSong}
              hasNext={currentSongIndex !== null && currentSongIndex < songs.length - 1}
              hasPrevious={currentSongIndex !== null && currentSongIndex > 0}
            />
          )}

          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="grid gap-4">
              <AnimatePresence>
                {songs.map((song: Song, index: number) => (
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
                      onStop={handleStopSong}
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
            <PlaylistCommentSection playlistId={Number.parseInt(playlistId)} />
          </motion.div>
        </>
      </main>
      <Footer />
    </div>
  )
}

