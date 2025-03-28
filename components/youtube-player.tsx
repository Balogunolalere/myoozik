"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from "lucide-react"
import { motion } from "framer-motion"
import { Slider } from "./ui/slider"

interface YouTubePlayerProps {
  videoId: string
  onEnded?: () => void
  autoplay?: boolean
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export function YouTubePlayer({
  videoId,
  onEnded,
  autoplay = false,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}: YouTubePlayerProps) {
  const [player, setPlayer] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const playerRef = useRef<HTMLDivElement>(null)
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null)
  const playerContainerId = useRef(`youtube-player-${Math.random().toString(36).substring(2, 9)}`)

  const clearTimeUpdateInterval = useCallback(() => {
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current)
      timeUpdateInterval.current = null
    }
  }, [])

  const startTimeUpdate = useCallback(() => {
    clearTimeUpdateInterval()
    if (player && isReady) {
      timeUpdateInterval.current = setInterval(() => {
        try {
          if (player.getCurrentTime && player.getDuration) {
            const currentTime = player.getCurrentTime() || 0
            const duration = player.getDuration() || 0
            setCurrentTime(currentTime)
            if (duration > 0) {
              setDuration(duration)
            }
          }
        } catch (error) {
          console.error("Error updating time:", error)
        }
      }, 100) // Update more frequently for smoother progress
    }
  }, [player, isReady])

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script")
      tag.src = "https://www.youtube.com/iframe_api"
      const firstScriptTag = document.getElementsByTagName("script")[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
      window.onYouTubeIframeAPIReady = initializePlayer
    } else {
      initializePlayer()
    }

    return () => {
      clearTimeUpdateInterval()
      if (player) {
        try {
          player.destroy()
        } catch (error) {
          console.error("Error destroying player:", error)
        }
      }
    }
  }, [])

  useEffect(() => {
    if (player && isReady && videoId) {
      try {
        player.loadVideoById(videoId)
        if (isPlaying) {
          player.playVideo()
        } else {
          player.pauseVideo()
        }
        // Reset time tracking
        setCurrentTime(0)
        const newDuration = player.getDuration()
        setDuration(newDuration)
      } catch (error) {
        console.error("Error loading video:", error)
      }
    }
  }, [videoId, isReady])

  const initializePlayer = () => {
    if (!playerRef.current) return

    try {
      const newPlayer = new window.YT.Player(playerContainerId.current, {
        height: "0",
        width: "0",
        videoId: videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: (event: any) => {
            console.error("YouTube player error:", event.data)
          },
        },
      })

      setPlayer(newPlayer)
    } catch (error) {
      console.error("Error initializing player:", error)
    }
  }

  const onPlayerReady = (event: any) => {
    try {
      setIsReady(true)
      const duration = event.target.getDuration() || 0
      setDuration(duration)
      if (autoplay) {
        event.target.playVideo()
      }
      // Start time updates immediately
      startTimeUpdate()
    } catch (error) {
      console.error("Error in onPlayerReady:", error)
    }
  }

  const onPlayerStateChange = (event: any) => {
    try {
      if (event.data === window.YT.PlayerState.PLAYING) {
        setIsPlaying(true)
        startTimeUpdate()
      } else if (event.data === window.YT.PlayerState.PAUSED) {
        setIsPlaying(false)
        // Keep updating time even when paused
        startTimeUpdate()
      } else if (event.data === window.YT.PlayerState.ENDED) {
        setIsPlaying(false)
        clearTimeUpdateInterval()
        if (onEnded) onEnded()
      } else if (event.data === window.YT.PlayerState.BUFFERING) {
        // Keep updating time during buffering
        startTimeUpdate()
      }
    } catch (error) {
      console.error("Error in onPlayerStateChange:", error)
    }
  }

  const togglePlay = useCallback(() => {
    if (player && isReady) {
      try {
        if (isPlaying) {
          player.pauseVideo()
        } else {
          player.playVideo()
        }
      } catch (error) {
        console.error("Error toggling play state:", error)
      }
    }
  }, [player, isPlaying, isReady])

  const toggleMute = useCallback(() => {
    if (player && isReady) {
      try {
        if (isMuted) {
          player.unMute()
          setIsMuted(false)
        } else {
          player.mute()
          setIsMuted(true)
        }
      } catch (error) {
        console.error("Error toggling mute state:", error)
      }
    }
  }, [player, isMuted, isReady])

  const handleSeek = useCallback((value: number[]) => {
    const seekTime = value[0]
    if (player && isReady) {
      try {
        player.seekTo(seekTime, true)
        setCurrentTime(seekTime)
      } catch (error) {
        console.error("Error seeking:", error)
      }
    }
  }, [player, isReady])

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <motion.div
      className="neobrutalist-container w-full bg-[#FD6C6C] relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div ref={playerRef}>
        <div id={playerContainerId.current}></div>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono min-w-[4em]">{formatTime(currentTime || 0)}</span>
          <Slider
            value={[currentTime || 0]}
            min={0}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            className="flex-1"
          />
          <span className="text-sm font-mono min-w-[4em]">{formatTime(duration || 0)}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <motion.button
              onClick={onPrevious}
              className="neobrutalist-button"
              disabled={!hasPrevious}
              whileHover={{ scale: hasPrevious ? 1.1 : 1 }}
              whileTap={{ scale: hasPrevious ? 0.9 : 1 }}
              aria-label="Previous song"
            >
              <SkipBack size={20} />
            </motion.button>
            <motion.button
              onClick={togglePlay}
              className="neobrutalist-button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </motion.button>
            <motion.button
              onClick={onNext}
              className="neobrutalist-button"
              disabled={!hasNext}
              whileHover={{ scale: hasNext ? 1.1 : 1 }}
              whileTap={{ scale: hasNext ? 0.9 : 1 }}
              aria-label="Next song"
            >
              <SkipForward size={20} />
            </motion.button>
            <motion.button
              onClick={toggleMute}
              className="neobrutalist-button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

