"use client"

import { useState, useEffect } from "react"
import { Star, Trophy } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface TopPlaylist {
  id: number
  title: string
  youtubeId: string
  totalRatings: number
  averageRating: number
}

export function TopPlaylistsScoreboard() {
  const [topPlaylists, setTopPlaylists] = useState<TopPlaylist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchTopPlaylists()
  }, [])

  const fetchTopPlaylists = async () => {
    try {
      const response = await fetch("/api/ratings/top")
      if (!response.ok) throw new Error("Failed to fetch top playlists")
      
      const data = await response.json()
      setTopPlaylists(data)
    } catch (error) {
      console.error("Error fetching top playlists:", error)
      setError("Failed to load top playlists")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center">Loading top playlists...</div>
  }

  if (error) {
    return <div className="text-center text-red-600">{error}</div>
  }

  if (topPlaylists.length === 0) {
    return <div className="text-center">No rated playlists yet</div>
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
                    {playlist.averageRating.toFixed(1)}
                  </span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600">
                    ({playlist.totalRatings})
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}