"use client"

import Link from "next/link"
import Image from "next/image"
import { Music, Star } from "lucide-react"
import { motion } from "framer-motion"

interface PlaylistCardProps {
  id: number
  youtubeId: string
  title: string
  description?: string | null
  thumbnailUrl?: string | null
  songCount: number
  averageRating?: number
}

export function PlaylistCard({
  id,
  youtubeId,
  title,
  description,
  thumbnailUrl,
  songCount,
  averageRating,
}: PlaylistCardProps) {
  return (
    <motion.div
      whileHover={{
        scale: 1.03,
        boxShadow: "0px 0px 0px 0px rgba(0,0,0,1)",
        y: 5,
        x: 5,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/playlist/${id}`} className="block h-full">
        <div className="neobrutalist-card h-full bg-[#FD6C6C]">
          <div className="relative aspect-video mb-3 overflow-hidden border-4 border-black">
            {thumbnailUrl ? (
              <Image src={thumbnailUrl || "/placeholder.svg"} alt={title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Music className="h-12 w-12 text-gray-400" />
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm">
              {songCount} {songCount === 1 ? "track" : "tracks"}
            </div>
          </div>

          <h3 className="font-bold text-lg line-clamp-2 mb-1" style={{ fontFamily: "var(--font-marker)" }}>
            {title}
          </h3>

          {description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-2" style={{ fontFamily: "var(--font-indie)" }}>
              {description}
            </p>
          )}

          {averageRating && (
            <div className="flex items-center gap-1 mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= Math.round(averageRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold">{averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

