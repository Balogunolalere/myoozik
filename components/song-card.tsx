"use client"

import { useState } from "react"
import Image from "next/image"
import { Play, Music, Pause, Volume2, VolumeX, X } from "lucide-react"
import { motion } from "framer-motion"

interface SongCardProps {
  id: number
  youtubeId: string
  title: string
  artist?: string
  thumbnailUrl?: string
  duration?: string
  onPlay: () => void
  onStop?: () => void
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
  onStop,
  isPlaying = false,
}: SongCardProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  const handleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMuted(!isMuted)
  }

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation()
    onStop?.()
  }

  return (
    <motion.div
      className="neobrutalist-card max-w-2xl mx-auto bg-gradient-to-r from-white to-gray-50"
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
      <div className="flex items-center gap-6 p-3">
        {/* Song Art and Info - Left Side */}
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="relative flex-shrink-0 w-[100px] h-[100px] border-4 border-black overflow-hidden rounded-lg">
            {thumbnailUrl ? (
              <Image src={thumbnailUrl} alt={title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Music className="h-8 w-8 text-gray-400" />
              </div>
            )}
            {duration && (
              <div className="absolute bottom-1 right-1 bg-black text-white text-xs px-1 py-0.5 rounded">
                {duration}
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <h3 
              className="font-bold text-lg break-words" 
              style={{ 
                fontFamily: "var(--font-marker)",
                display: '-webkit-box',
                WebkitLineClamp: '2',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {title}
            </h3>
            {artist && (
              <p 
                className="text-sm text-gray-600"
                style={{ 
                  fontFamily: "var(--font-indie)",
                  display: '-webkit-box',
                  WebkitLineClamp: '1',
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {artist}
              </p>
            )}

            {isPlaying && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 bg-[#FD6C6C] rounded-full"
                      animate={{
                        height: [6, 16, 6],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
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

        {/* Vinyl Player - Right Side */}
        <div className="relative flex-shrink-0 w-[100px] h-[100px]">
          <motion.div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at center, #333 0%, #000 70%)`,
              borderRadius: '50%',
              border: '8px solid #222',
            }}
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 2, repeat: isPlaying ? Infinity : 0, ease: "linear" }}
          >
            {/* Vinyl grooves */}
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full"
                style={{
                  border: '1px solid rgba(255,255,255,0.1)',
                  margin: `${(i + 1) * 8}px`,
                }}
              />
            ))}
            
            {/* Center label */}
            <div className="absolute inset-[30%] rounded-full bg-[#FD6C6C] border-4 border-[#333] flex items-center justify-center overflow-hidden">
              <div className="w-2 h-2 bg-black rounded-full" />
            </div>
          </motion.div>

          {/* Control overlay */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovering || isPlaying ? 1 : 0 }}
          >
            <motion.button
              onClick={onPlay}
              className="neobrutalist-button !p-2 bg-white/90 hover:bg-[#FD6C6C]"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={isPlaying ? "Pause song" : "Play song"}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </motion.button>
            {isPlaying && (
              <>
                <motion.button
                  onClick={handleMute}
                  className="neobrutalist-button !p-2 bg-white/90 hover:bg-[#FD6C6C]"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </motion.button>
                <motion.button
                  onClick={handleStop}
                  className="neobrutalist-button !p-2 bg-white/90 hover:bg-[#FD6C6C]"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Stop playback"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

