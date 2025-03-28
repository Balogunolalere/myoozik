"use client"

import { useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PlaylistCard } from "@/components/playlist-card"
import { TopPlaylistsScoreboard } from "@/components/top-playlists-scoreboard"
import { VinylSpinner } from "@/components/vinyl-spinner"
import Link from "next/link"
import { motion } from "framer-motion"

interface Playlist {
  id: number
  youtubeId: string
  title: string
  description: string | null
  thumbnailUrl?: string | null
  songCount: number
  averageRating?: number
}

export default function Home() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    fetchPlaylists()
  }, [])

  const fetchPlaylists = async () => {
    setIsLoading(true)
    const supabase = createClientSupabaseClient()

    try {
      // Get playlists
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
        playlistsData.map(async (playlist) => {
          // Get songs for this playlist
          const { data: songs, error: songsError } = await supabase
            .from("songs")
            .select("id, thumbnail_url")
            .eq("playlist_id", playlist.id)
            .returns<{ id: number; thumbnail_url: string | null }[]>()

          if (songsError) throw songsError

          const songCount = songs ? songs.length : 0
          const thumbnailUrl = songs && songs.length > 0 ? songs[0].thumbnail_url : undefined

          // Get ratings for this playlist
          const { data: ratings, error: ratingsError } = await supabase
            .from("playlist_ratings")
            .select("rating")
            .eq("playlist_id", playlist.id)
            .returns<{ rating: number }[]>()

          if (ratingsError) throw ratingsError

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
            thumbnailUrl,
            songCount,
            averageRating,
          }
        })
      )

      setPlaylists(processedPlaylists)
    } catch (error) {
      console.error("Error fetching playlists:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <section className="mb-12">
          <motion.div
            className="neobrutalist-container bg-[#FD6C6C] mb-8 relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative z-10">
              <div className="text-container">
                <motion.h1
                  className="text-4xl md:text-6xl font-bold mb-4"
                  style={{ fontFamily: "var(--font-marker)" }}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  myo͞ozik
                </motion.h1>
                <motion.p
                  className="text-xl md:text-2xl mb-6"
                  style={{ fontFamily: "var(--font-indie)" }}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  Share, rate, and discover YouTube music playlists anonymously.
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/add-playlist" className="neobrutalist-button inline-block">
                    Add Your Playlist
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>

        <motion.section
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <TopPlaylistsScoreboard />
        </motion.section>

        <section>
          <motion.h2
            className="text-2xl font-bold mb-6 border-b-4 border-black pb-2"
            style={{ fontFamily: "var(--font-marker)" }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Featured Playlists
          </motion.h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <VinylSpinner size={64} />
            </div>
          ) : playlists.length === 0 ? (
            <motion.div
              className="neobrutalist-container text-center py-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xl mb-4" style={{ fontFamily: "var(--font-indie)" }}>
                No playlists yet!
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/add-playlist" className="neobrutalist-button inline-block">
                  Add the First Playlist
                </Link>
              </motion.div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {playlists.map((playlist, index) => (
                <motion.div
                  key={playlist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <PlaylistCard
                    id={playlist.id}
                    youtubeId={playlist.youtubeId}
                    title={playlist.title}
                    description={playlist.description}
                    thumbnailUrl={playlist.thumbnailUrl}
                    songCount={playlist.songCount}
                    averageRating={playlist.averageRating}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}

