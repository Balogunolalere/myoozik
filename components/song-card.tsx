"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Play, Pause, Music, Volume2, VolumeX, X } from "lucide-react"
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
  onMute?: () => void
  isPlaying?: boolean
  isMuted?: boolean
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
  onMute,
  isPlaying = false,
  isMuted = false,
}: SongCardProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isCancelled, setIsCancelled] = useState(false)

  // Reset cancelled state when the song starts playing
  useEffect(() => {
    if (isPlaying) {
      setIsCancelled(false)
      setShowControls(true)
    }
  }, [isPlaying])

  const handleVinylClick = () => {
    if (!showControls) {
      setShowControls(true)
    }
    setIsCancelled(false)  // Always reset cancelled state on vinyl click
    onPlay()
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowControls(false)
    setIsCancelled(true)
    if (onStop) {
      onStop()
    }
  }

  return (
    <motion.div
      className="neobrutalist-card w-full bg-gradient-to-r from-white to-gray-50 overflow-hidden"
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
      <div className="flex items-center gap-2 sm:gap-6 p-2 sm:p-3">
        {/* Song Art and Info - Left Side */}
        <div className="flex items-start gap-2 sm:gap-4 flex-1 min-w-0">
          <div className="relative flex-shrink-0 w-[60px] h-[60px] sm:w-[100px] sm:h-[100px] border-4 border-black overflow-hidden rounded-lg">
            {thumbnailUrl ? (
              <Image src={thumbnailUrl} alt={title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Music className="h-12 w-12 text-gray-400" />
              </div>
            )}
            {duration && (
              <div className="absolute bottom-1 right-1 bg-black text-white text-[10px] sm:text-xs px-1 py-0.5 rounded">
                {duration}
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <h3 
              className="font-bold text-base sm:text-lg break-words" 
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
                className="text-xs sm:text-sm text-gray-600"
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

            {/* Wave visualizer - Only show when playing and not cancelled */}
            {isPlaying && !isCancelled && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 sm:w-1.5 h-1 sm:h-1.5 bg-[#FD6C6C] rounded-full"
                      animate={{
                        height: [4, 12, 4],
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

        {/* Vinyl Record - Right Side */}
        <div 
          className="relative flex-shrink-0 w-[60px] h-[60px] sm:w-[100px] sm:h-[100px] cursor-pointer" 
          onClick={handleVinylClick}
        >
          {/* Base vinyl disc - Always visible */}
          <motion.div 
            className="absolute inset-0 z-10"
            style={{
              backgroundColor: '#000',
              borderRadius: '50%',
              border: '4px solid #222',
              width: '100%',
              height: '100%',
            }}
            animate={{ 
              rotate: isPlaying && !isCancelled ? 360 : 0,
              scale: (isPlaying && !isCancelled) ? 1 : 0.95,
            }}
            transition={{ 
              rotate: {
                duration: 2,
                repeat: (isPlaying && !isCancelled) ? Infinity : 0,
                ease: "linear"
              },
              scale: { duration: 0.3 }
            }}
          >
            {/* Vinyl grooves */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 border border-gray-600/30 rounded-full"
                style={{
                  margin: `${(i + 1) * 3}px`,
                }}
              />
            ))}
            
            {/* Center label */}
            <motion.div 
              className="absolute bg-[#FD6C6C] flex items-center justify-center"
              style={{
                width: '40%',
                height: '40%',
                borderRadius: '50%',
                border: '2px solid #333',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="w-[20%] h-[20%] bg-black rounded-full" />
            </motion.div>

            {/* Reflection effect */}
            <div 
              className="absolute inset-0 rounded-full" 
              style={{
                background: 'linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 52%, transparent 55%)',
                pointerEvents: 'none'
              }}
            />
          </motion.div>

          {/* Play button on hover when controls are hidden */}
          {!showControls && isHovering && !isCancelled && (
            <motion.div
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 rounded-full hidden sm:flex"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowControls(true)
                  onPlay()
                }}
                className="neobrutalist-button !p-[3px] sm:!p-1.5 bg-white/90 hover:bg-[#FD6C6C] z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Play className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
              </motion.button>
            </motion.div>
          )}

          {/* Full controls overlay */}
          {showControls && !isCancelled && (
            <motion.div
              className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 rounded-full" 
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovering || isPlaying ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-1">
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation()
                    onPlay()
                  }}
                  className="neobrutalist-button !p-[3px] sm:!p-1.5 bg-white/90 hover:bg-[#FD6C6C] z-10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={isPlaying ? "Pause song" : "Play song"}
                >
                  {isPlaying ? 
                    <Pause className="h-2.5 w-2.5 sm:h-4 sm:w-4" /> : 
                    <Play className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
                  }
                </motion.button>

                {onMute && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation()
                      onMute()
                    }}
                    className="neobrutalist-button !p-[3px] sm:!p-1.5 bg-white/90 hover:bg-[#FD6C6C] z-10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted ? 
                      <VolumeX className="h-2.5 w-2.5 sm:h-4 sm:w-4" /> : 
                      <Volume2 className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
                    }
                  </motion.button>
                )}

                <motion.button
                  onClick={handleCancel}
                  className="neobrutalist-button !p-[3px] sm:!p-1.5 bg-white/90 hover:bg-red-500 hover:text-white z-10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Hide controls"
                >
                  <X className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

