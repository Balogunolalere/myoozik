"use client"

import { useEffect, useRef } from "react"
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
import { Clock, Music, Share2, Users } from "lucide-react"
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
  const playerRef = useRef<any>(null)

  useEffect(() => {
    const loadPlaylist = async () => {
      await fetchPlaylistDetails(playlistId)
    }
    loadPlaylist()
    return () => reset()
  }, [playlistId, fetchPlaylistDetails, reset])

  const handlePlaySong = (index: number) => {
    if (currentSongIndex === index) {
      // If clicking the same song, just toggle play/pause
      if (playerRef.current?.togglePlay) {
        playerRef.current.togglePlay()
      }
    } else {
      // If clicking a different song, change to it
      setCurrentSongIndex(index)
    }
  }

  const handleStopSong = () => {
    if (playerRef.current?.togglePlay) {
      playerRef.current.togglePlay()
    }
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
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <VinylSpinner size={120} />
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <motion.div 
            className="neobrutalist-container bg-red-100 text-center py-12 max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xl text-red-600 mb-4">{error}</p>
            <motion.button 
              onClick={() => fetchPlaylistDetails(playlistId)} 
              className="neobrutalist-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Try Again
            </motion.button>
          </motion.div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      {/* Hidden YouTubePlayer */}
      {currentSong && (
        <YouTubePlayer
          ref={playerRef}
          videoId={currentSong.youtube_video_id}
          onEnded={handleSongEnded}
          autoplay={true}
          onNext={handleNextSong}
          onPrevious={handlePreviousSong}
          hasNext={currentSongIndex !== null && currentSongIndex < songs.length - 1}
          hasPrevious={currentSongIndex !== null && currentSongIndex > 0}
        />
      )}

      <main className="flex-1">
        {/* Hero Section */}
        <motion.div
          className="w-full bg-white py-12 relative overflow-hidden border-b-4 border-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto relative">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h1 
                  className="text-4xl md:text-5xl font-bold text-black mb-4 break-words"
                  style={{ fontFamily: "var(--font-marker)" }}
                >
                  {currentPlaylist?.title}
                </h1>
                {currentPlaylist?.description && (
                  <p 
                    className="text-xl text-gray-600 mb-6"
                    style={{ fontFamily: "var(--font-indie)" }}
                  >
                    {currentPlaylist.description}
                  </p>
                )}
              </motion.div>

              <div className="flex flex-wrap gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  <span>{songs.length} songs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>
                    {Math.ceil(songs.reduce((acc, song) => {
                      const [mins, secs] = (song.duration || "0:00").split(":")
                      return acc + (parseInt(mins) * 60 + parseInt(secs))
                    }, 0) / 60)} mins
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{currentPlaylist?.total_ratings || 0} ratings</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Rating Section */}
            <motion.div
              className="mb-12 neobrutalist-container bg-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex flex-col items-center py-6">
                <h3 
                  className="text-2xl font-bold mb-4"
                  style={{ fontFamily: "var(--font-marker)" }}
                >
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
            </motion.div>

            {/* Songs Section */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h2 
                className="text-2xl font-bold mb-6"
                style={{ fontFamily: "var(--font-marker)" }}
              >
                Songs
              </h2>
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

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <PlaylistCommentSection playlistId={Number.parseInt(playlistId)} />
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

