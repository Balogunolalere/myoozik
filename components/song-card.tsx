"use client"

import { useState } from "react"
import Image from "next/image"
import { Play, Music, Pause } from "lucide-react"
import { motion } from "framer-motion"

interface SongCardProps {
  id: number
  youtubeId: string
  title: string
  artist?: string
  thumbnailUrl?: string
  duration?: string
  onPlay: () => void
  isPlaying?: boolean
}

export function SongCard({
  id,
  youtubeId,
  title,
  artist,
  thumbnailUrl,
  duration,
  onPlay,
  isPlaying = false,
}: SongCardProps) {
  const [isHovering, setIsHovering] = useState(false)

  return (
    <motion.div
      className={`neobrutalist-card max-w-2xl mx-auto ${isPlaying ? "bg-[#FD6C6C]/20" : ""}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      whileHover={{
        scale: 1.02,
        boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)",
        y: 5,
        x: 5,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-4">
        <div className="relative min-w-[120px] h-[120px] border-4 border-black overflow-hidden">
          {thumbnailUrl ? (
            <Image src={thumbnailUrl || "/placeholder.svg"} alt={title} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Music className="h-8 w-8 text-gray-400" />
            </div>
          )}

          <motion.button
            onClick={onPlay}
            className="absolute inset-0 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovering || isPlaying ? 1 : 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label={isPlaying ? "Now playing" : "Play song"}
          >
            {isPlaying ? <Pause className="h-10 w-10 text-white" /> : <Play className="h-10 w-10 text-white" />}
          </motion.button>

          {duration && (
            <div className="absolute bottom-1 right-1 bg-black text-white text-xs px-1 py-0.5">{duration}</div>
          )}
        </div>

        <div className="flex flex-col flex-1">
          <div>
            <h3 className="font-bold text-lg line-clamp-2" style={{ fontFamily: "var(--font-marker)" }}>
              {title}
            </h3>
            {artist && (
              <p className="text-sm text-gray-600" style={{ fontFamily: "var(--font-indie)" }}>
                {artist}
              </p>
            )}
          </div>

          {isPlaying && (
            <div className="mt-auto">
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-[#FD6C6C] rounded-full"
                    animate={{
                      height: [2, 12, 2],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.2,
                      repeatType: "reverse",
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

