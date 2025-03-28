"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { PlaylistCard } from "@/components/playlist-card"
import { TopPlaylistsScoreboard } from "@/components/top-playlists-scoreboard"
import { VinylSpinner } from "@/components/vinyl-spinner"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import usePlaylistStore from "@/lib/stores/playlist-store"
import type { Playlist } from "@/lib/types"

export default function Home() {
  const { playlists, isLoading, error, fetchPlaylists } = usePlaylistStore()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    fetchPlaylists()
  }, [fetchPlaylists])

  if (!isMounted) {
    return null
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
                  className="text-4xl font-bold mb-4"
                  style={{ fontFamily: "var(--font-marker)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Welcome to Myoozik
                </motion.h1>
                <motion.p
                  className="text-lg mb-6"
                  style={{ fontFamily: "var(--font-indie)" }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Share and discover YouTube music playlists. Rate your favorites and join the conversation!
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Link href="/add-playlist">
                    <Button className="neobrutalist-button">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your Playlist
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="grid gap-8 grid-cols-1 md:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {[
              {
                title: "Discover",
                description: "Find new music from other users' playlists",
                icon: "🎵",
              },
              {
                title: "Share",
                description: "Share your favorite YouTube playlists with others",
                icon: "🎶",
              },
              {
                title: "Rate",
                description: "Rate playlists and leave comments anonymously",
                icon: "⭐",
              },
            ].map((item, index) => (
              <motion.div 
                key={index} 
                className="neobrutalist-container text-center bg-[#FD6C6C]" 
                whileHover={{ y: -5 }}
              >
                <div className="flex justify-center mb-4 text-4xl">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-marker)" }}>
                  {item.title}
                </h3>
                <p style={{ fontFamily: "var(--font-indie)" }}>{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <section className="mb-12">
          <TopPlaylistsScoreboard />
        </section>

        <section>
          <motion.h2
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: "var(--font-marker)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            All Playlists
          </motion.h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <VinylSpinner size={64} />
            </div>
          ) : error ? (
            <motion.div
              className="neobrutalist-container bg-red-100 text-center py-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-xl text-red-600 mb-4">{error}</p>
              <Button onClick={fetchPlaylists} className="neobrutalist-button">
                Try Again
              </Button>
            </motion.div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
              <AnimatePresence>
                {playlists.map((playlist: Playlist) => (
                  <PlaylistCard
                    key={playlist.id}
                    id={playlist.id}
                    youtubeId={playlist.youtubeId}
                    title={playlist.title}
                    description={playlist.description}
                    thumbnailUrl={playlist.thumbnailUrl}
                    songCount={playlist.songCount}
                    averageRating={playlist.averageRating}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}

