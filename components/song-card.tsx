"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Play, Music, Pause, Volume2, VolumeX, X, Square } from "lucide-react"
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
  onStop, // Assuming onStop handles both pause and stop actions from the parent
  onMute, // Added to handle mute/unmute control
  isPlaying = false,
  isMuted = false, // External mute state
}: SongCardProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [localMuteState, setLocalMuteState] = useState(isMuted)
  // Reflects the actual playback state (playing or not)
  const [localPlayState, setLocalPlayState] = useState(isPlaying)
  // Indicates if the stop button was the last action causing non-play state
  const [isStopped, setIsStopped] = useState(false)
  // Indicates if the cancel button was the last action causing non-play state
  const [isCanceled, setIsCanceled] = useState(false)
  
  // Sync local state with the isPlaying prop from parent
  useEffect(() => {
    setLocalPlayState(isPlaying)
    // If the parent indicates playback started, reset stopped/canceled states
    if (isPlaying) {
      setIsStopped(false)
      setIsCanceled(false)
    }
    // If the parent indicates playback stopped, and it wasn't due to local stop/cancel,
    // treat it as a pause (don't set isStopped or isCanceled)
    else if (!isStopped && !isCanceled) {
       // No explicit action needed here, localPlayState is already set to false
    }
  }, [isPlaying]) // Removed isStopped, isCanceled dependency to avoid loops

  // Sync local mute state with parent
  useEffect(() => {
    setLocalMuteState(isMuted);
  }, [isMuted]);
  
  const handleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Only call the external mute handler if this is the currently playing song
    if (onMute) {
      onMute(); // Let the parent handle the actual muting
    } else {
      // For non-playing songs, just update local state
      setLocalMuteState(!localMuteState);
    }
  }
  
  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (localPlayState) {
      // Currently playing -> Pause
      onStop?.() // Request stop/pause from parent
      setLocalPlayState(false)
      // Keep isStopped and isCanceled as they are (it's just a pause)
    } else {
      // Currently paused/stopped/canceled -> Play
      onPlay() // Request play from parent
      setLocalPlayState(true)
      setIsStopped(false) // Reset stopped state
      setIsCanceled(false) // Reset canceled state
    }
  }
  
  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Only act if playing or if it's currently stopped but hovered 
    if (localPlayState || isStopped) { 
        onStop?.() // Request stop from parent
        setLocalPlayState(false)
        setIsStopped(true) // Mark as explicitly stopped
        setIsCanceled(false) // Ensure not marked as canceled
    }
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation()
     // Only act if playing, paused, stopped, or hovered
     if (localPlayState || isStopped || isHovering) { 
        onStop?.() // Request stop from parent
        setLocalPlayState(false)
        setIsStopped(false) // Ensure not marked as stopped
        setIsCanceled(true) // Mark as explicitly canceled: This hides controls on hover
     }
  }

  // Determine if the main controls should be visible.
  // Show controls if:
  // 1. The song is currently playing (localPlayState is true)
  // OR
  // 2. The card is being hovered AND it has not been explicitly canceled (!isCanceled).
  // Clicking Stop sets isCanceled to false, so controls remain visible on hover.
  // Clicking Cancel sets isCanceled to true, so controls hide on hover.
  const showControls = localPlayState || (isHovering && !isCanceled);
  
  // Determine if the separate play button (for canceled state) should be shown
  const showCanceledPlayButton = isCanceled && isHovering;

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

        {/* Vinyl/Control Area */}
        <div className="relative flex-shrink-0 w-[60px] h-[60px] sm:w-[100px] sm:h-[100px]">
          {/* Vinyl Disc */}
          <motion.div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at center, #333 0%, #000 70%)`,
              borderRadius: '50%',
              border: '4px sm:8px solid #222',
            }}
            animate={{ rotate: localPlayState ? 360 : 0 }} // Animate based on localPlayState
            transition={{ duration: 2, repeat: localPlayState ? Infinity : 0, ease: "linear" }}
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

          {/* Control overlay - Visibility depends on showControls */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full" 
            initial={{ opacity: 0 }}
            animate={{ opacity: showControls ? 1 : 0 }} // Controls visibility
            transition={{ duration: 0.2 }}
          >
            {/* Conditional rendering inside ensures buttons don't exist when hidden */}
            {showControls && (
              <div className="flex items-center gap-[2px] sm:gap-1">
                {/* Play/Pause Button */}
                <motion.button
                  onClick={handlePlayPause}
                  className="neobrutalist-button !p-[3px] sm:!p-1.5 bg-white/90 hover:bg-[#FD6C6C]"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={localPlayState ? "Pause song" : "Play song"}
                >
                  {localPlayState ? <Pause className="h-2.5 w-2.5 sm:h-4 sm:w-4" /> : <Play className="h-2.5 w-2.5 sm:h-4 sm:w-4" />}
                </motion.button>
                
                {/* Mute/Stop/Cancel Buttons - Always show these if the main controls are visible */}
                <>
                  <motion.button
                    onClick={handleMute}
                    className="neobrutalist-button !p-[3px] sm:!p-1.5 bg-white/90 hover:bg-[#FD6C6C]"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={localMuteState ? "Unmute" : "Mute"}
                  >
                    {localMuteState ? <VolumeX className="h-2.5 w-2.5 sm:h-4 sm:w-4" /> : <Volume2 className="h-2.5 w-2.5 sm:h-4 sm:w-4" />}
                  </motion.button>
                  <motion.button
                    onClick={handleStop}
                    className="neobrutalist-button !p-[3px] sm:!p-1.5 bg-white/90 hover:bg-[#FD6C6C]"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Stop playback"
                  >
                    <Square className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
                  </motion.button>
                  <motion.button
                    onClick={handleCancel}
                    className="neobrutalist-button !p-[3px] sm:!p-1.5 bg-white/90 hover:bg-[#FD6C6C]"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Cancel playback"
                  >
                    <X className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
                  </motion.button>
                </>
              </div>
            )}
          </motion.div>
          
          {/* Separate Play Button Overlay - Visibility depends on showCanceledPlayButton */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full" 
            initial={{ opacity: 0 }}
            animate={{ opacity: showCanceledPlayButton ? 1 : 0 }} // Controls visibility
            transition={{ duration: 0.2 }}
          >
             {/* Conditional rendering inside ensures button doesn't exist when hidden */}
            {showCanceledPlayButton && (
              <motion.button
                onClick={handlePlayPause} // Re-use handlePlayPause to start playing
                className="neobrutalist-button !p-[3px] sm:!p-1.5 bg-white/90 hover:bg-[#FD6C6C]"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Play song"
              >
                <Play className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

