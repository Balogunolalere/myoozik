"use client"

import { useState, useEffect } from "react"
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
  const [localPlayState, setLocalPlayState] = useState(isPlaying)
  const [isStopped, setIsStopped] = useState(false)
  
  // Update local state when prop changes
  useEffect(() => {
    setLocalPlayState(isPlaying)
    if (isPlaying) {
      setIsStopped(false)
    }
  }, [isPlaying])

  const handleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsMuted(!isMuted)
  }
  
  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (localPlayState) {
      onStop?.()
      setLocalPlayState(false)
    } else {
      setIsStopped(false)
      onPlay()
      setLocalPlayState(true)
    }
  }
  
  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation()
    onStop?.()
    setLocalPlayState(false)
    setIsStopped(true)
    setIsHovering(false)
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
                <Music className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
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

            {isPlaying && (
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

        {/* Vinyl Player - Right Side */}
        <div className="relative flex-shrink-0 w-[60px] h-[60px] sm:w-[100px] sm:h-[100px]">
          <motion.div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at center, #333 0%, #000 70%)`,
              borderRadius: '50%',
              border: '4px sm:8px solid #222',
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
                  margin: `${(i + 1) * 4}px sm:${(i + 1) * 8}px`,
                }}
              />
            ))}
            
            {/* Center label */}
            <div className="absolute inset-[30%] rounded-full bg-[#FD6C6C] border-2 sm:border-4 border-[#333] flex items-center justify-center overflow-hidden">
              <div className="w-1 h-1 sm:w-2 sm:h-2 bg-black rounded-full" />
            </div>
          </motion.div>

          {/* Control overlay */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center gap-1 sm:gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: (isHovering || localPlayState) && !isStopped ? 1 : 0 }}
          >
            {!isStopped && (
              <>
                <motion.button
                  onClick={handlePlayPause}
                  className="neobrutalist-button !p-1.5 sm:!p-2 bg-white/90 hover:bg-[#FD6C6C]"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={localPlayState ? "Pause song" : "Play song"}
                >
                  {localPlayState ? <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5" />}
                </motion.button>
                {(localPlayState || isHovering) && (
                  <>
                    <motion.button
                      onClick={handleMute}
                      className="neobrutalist-button !p-1.5 sm:!p-2 bg-white/90 hover:bg-[#FD6C6C]"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </motion.button>
                    <motion.button
                      onClick={handleStop}
                      className="neobrutalist-button !p-1.5 sm:!p-2 bg-white/90 hover:bg-[#FD6C6C]"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label="Stop playback"
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </motion.button>
                  </>
                )}
              </>
            )}
          </motion.div>
          
          {/* Show play button on hover when stopped */}
          {isStopped && isHovering && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.button
                onClick={handlePlayPause}
                className="neobrutalist-button !p-1.5 sm:!p-2 bg-white/90 hover:bg-[#FD6C6C]"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Play song"
              >
                <Play className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

