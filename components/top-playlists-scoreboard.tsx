"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Star, Trophy } from "lucide-react"
import { VinylSpinner } from "@/components/vinyl-spinner"
import { motion, AnimatePresence } from "framer-motion"
import usePlaylistStore from "@/lib/stores/playlist-store"

export function TopPlaylistsScoreboard() {
  const { playlists, isLoading, error, fetchPlaylists } = usePlaylistStore()

  useEffect(() => {
    fetchPlaylists()
  }, [])

  // Get top 3 rated playlists
  const topPlaylists = [...playlists]
    .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    .slice(0, 3)
    .filter(playlist => playlist.averageRating !== undefined)

  if (isLoading) {
    return (
      <div className="neobrutalist-container bg-[#FD6C6C] p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-marker)" }}>
          <Trophy className="h-6 w-6" />
          Loading Top Rated Playlists
        </h2>
        <div className="flex justify-center items-center gap-8 py-12">
          {[40, 48, 32].map((size, index) => (
            <motion.div
              key={index}
              initial={{ y: 0 }}
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut"
              }}
            >
              <VinylSpinner size={size} />
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="neobrutalist-container bg-[#FD6C6C] p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-marker)" }}>
          <Trophy className="h-6 w-6" />
          Top Rated Playlists
        </h2>
        <div className="text-center text-red-600">{error}</div>
      </div>
    )
  }

  if (topPlaylists.length === 0) {
    return (
      <div className="neobrutalist-container bg-[#FD6C6C] p-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-marker)" }}>
          <Trophy className="h-6 w-6" />
          Top Rated Playlists
        </h2>
        <div className="text-center">No rated playlists yet</div>
      </div>
    )
  }

  const trophyColors = ["text-yellow-400", "text-gray-400", "text-amber-600"]

  return (
    <div className="neobrutalist-container bg-[#FD6C6C] p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-marker)" }}>
        <Trophy className="h-6 w-6" />
        Top Rated Playlists
      </h2>
      <div className="space-y-4">
        {topPlaylists.map((playlist, index) => (
          <motion.div
            key={playlist.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white/70 p-4 rounded-lg backdrop-blur-sm border-2 border-black"
          >
            <Link href={`/playlist/${playlist.id}`} className="block">
              <div className="flex items-center gap-2">
                <Trophy className={`h-5 w-5 ${trophyColors[index]}`} />
                <h3 className="font-bold flex-1" style={{ fontFamily: "var(--font-marker)" }}>
                  {playlist.title}
                </h3>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold">
                    {playlist.averageRating?.toFixed(1)}
                  </span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}