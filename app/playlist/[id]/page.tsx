"use client"

import { useEffect, useRef, useState } from "react"
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
import { ErrorBoundary } from "@/components/error-boundary"

interface PageProps {
  params: {
    id: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

function PlaylistPageContent({ params }: PageProps) {
  const playlistId = params?.id
  if (!playlistId) {
    throw new Error("Playlist ID is required")
  }

  const { currentPlaylist, songs, currentSongIndex, isLoading, error, fetchPlaylistDetails, setCurrentSongIndex } = usePlaylistStore()
  const { reset } = useInteractionStore()
  const playerRef = useRef<any>(null)
  const [isPlayerPlaying, setIsPlayerPlaying] = useState(false)
  const [isPlayerMuted, setIsPlayerMuted] = useState(false)
  const [isAutoPlayingNext, setIsAutoPlayingNext] = useState(false)

  useEffect(() => {
    const loadPlaylist = async () => {
      if (!playlistId) return
      await fetchPlaylistDetails(playlistId)
    }
    loadPlaylist()
    return () => {
      // Cleanup player on unmount
      if (playerRef.current?.cancel) {
        playerRef.current.cancel()
      }
      reset()
    }
  }, [playlistId, fetchPlaylistDetails, reset])

  const handlePlaySong = (index: number) => {
    if (currentSongIndex === index) {
      // If clicking the same song, just toggle play/pause
      if (playerRef.current?.togglePlay) {
        playerRef.current.togglePlay()
      }
    } else {
      // If we have a current song playing, cancel it first
      if (currentSongIndex !== null && playerRef.current?.cancel) {
        playerRef.current.cancel()
      }
      // Small delay to ensure cleanup
      setTimeout(() => {
        setCurrentSongIndex(index)
        setIsPlayerPlaying(true)
        setIsAutoPlayingNext(false)
      }, 50)
    }
  }

  const handleStopSong = () => {
    if (playerRef.current?.stop) {
      playerRef.current.stop()
      setIsPlayerPlaying(false)
    }
  }

  const handleCancelSong = () => {
    if (playerRef.current?.cancel) {
      playerRef.current.cancel()
      setCurrentSongIndex(null)
      setIsPlayerPlaying(false)
    }
  }
  
  const handleToggleMute = () => {
    if (playerRef.current?.toggleMute) {
      playerRef.current.toggleMute()
      setIsPlayerMuted(!isPlayerMuted)
    }
  }

  const handleSongEnded = () => {
    // Check if there's a next song available
    if (currentSongIndex !== null && currentSongIndex < songs.length - 1) {
      setIsAutoPlayingNext(true)
      // Switch to next song with a small delay
      setTimeout(() => {
        setCurrentSongIndex(currentSongIndex + 1)
        setIsPlayerPlaying(true)
      }, 50)
    } else {
      // If we're at the last song, stop playing
      setIsPlayerPlaying(false)
      setCurrentSongIndex(null)
    }
  }

  const handleNextSong = () => {
    if (currentSongIndex !== null && currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(currentSongIndex + 1)
      setIsPlayerPlaying(true)
      setIsAutoPlayingNext(false)
    }
  }

  const handlePreviousSong = () => {
    if (currentSongIndex !== null && currentSongIndex > 0) {
      setCurrentSongIndex(currentSongIndex - 1)
      setIsPlayerPlaying(true)
      setIsAutoPlayingNext(false)
    }
  }

  const handleRatingSubmit = async () => {
    await fetchPlaylistDetails(playlistId)
  }

  const handlePlayStateChange = (isPlaying: boolean) => {
    setIsPlayerPlaying(isPlaying)
  }
  
  const handleMuteStateChange = (isMuted: boolean) => {
    setIsPlayerMuted(isMuted)
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
          autoplay={isPlayerPlaying || isAutoPlayingNext}
          onNext={handleNextSong}
          onPrevious={handlePreviousSong}
          hasNext={currentSongIndex !== null && currentSongIndex < songs.length - 1}
          hasPrevious={currentSongIndex !== null && currentSongIndex > 0}
          onPlayStateChange={handlePlayStateChange}
          onMuteStateChange={handleMuteStateChange}
        />
      )}

      <main className="flex-1">
        {/* Hero Section */}
        <motion.div
          className="w-full bg-white py-12 relative overflow-hidden"
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
              className="mb-12 neobrutalist-container !bg-[#FD6C6C]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex flex-col items-center py-6">
                <h3 
                  className="text-2xl font-bold mb-4 text-white"
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
                        onStop={currentSongIndex === index ? handleStopSong : handleCancelSong}
                        onMute={currentSongIndex === index ? handleToggleMute : undefined}
                        isPlaying={currentSongIndex === index && isPlayerPlaying}
                        isMuted={currentSongIndex === index && isPlayerMuted}
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

export default function PlaylistPage(props: PageProps) {
  return (
    <ErrorBoundary>
      <PlaylistPageContent {...props} />
    </ErrorBoundary>
  )
}

