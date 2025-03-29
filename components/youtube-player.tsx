"use client"

import { forwardRef, useEffect, useRef, useCallback, useImperativeHandle, useState } from "react"
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
  onPlayStateChange?: (isPlaying: boolean) => void
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export const YouTubePlayer = forwardRef<{ 
  togglePlay: () => void, 
  stop: () => void,
  cancel: () => void 
}, YouTubePlayerProps>(({
  videoId,
  onEnded,
  autoplay = false,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  onPlayStateChange,
}, ref) => {
  const [player, setPlayer] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [savedTime, setSavedTime] = useState(0)
  const playerRef = useRef<HTMLDivElement>(null)
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null)
  const playerContainerId = useRef(`youtube-player-${Math.random().toString(36).substring(2, 9)}`)

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    togglePlay: () => {
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
    },
    stop: () => {
      if (player && isReady) {
        try {
          player.seekTo(0)
          player.pauseVideo()
          setIsPlaying(false)
          onPlayStateChange?.(false)
          setCurrentTime(0)
        } catch (error) {
          console.error("Error stopping video:", error)
        }
      }
    },
    cancel: () => {
      if (player && isReady) {
        try {
          player.seekTo(0)
          player.stopVideo()
          setIsPlaying(false)
          onPlayStateChange?.(false)
          setCurrentTime(0)
        } catch (error) {
          console.error("Error canceling video:", error)
        }
      }
    }
  }))

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
        if (savedTime > 0) {
          player.loadVideoById({
            videoId: videoId,
            startSeconds: savedTime
          })
        } else {
          player.loadVideoById(videoId)
        }
        if (isPlaying) {
          player.playVideo()
        } else {
          player.pauseVideo()
        }
        setCurrentTime(savedTime)
        const newDuration = player.getDuration()
        setDuration(newDuration)
      } catch (error) {
        console.error("Error loading video:", error)
      }
    }
  }, [videoId, isReady])

  useEffect(() => {
    if (player && isReady) {
      try {
        if (isMuted) {
          player.mute()
        } else {
          player.unMute()
        }
      } catch (error) {
        console.error("Error updating mute state:", error)
      }
    }
  }, [isMuted, player, isReady])

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
          playsinline: 1, // Enable inline playback on mobile
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
        onPlayStateChange?.(true)
        startTimeUpdate()
      } else if (event.data === window.YT.PlayerState.PAUSED) {
        setIsPlaying(false)
        onPlayStateChange?.(false)
        // Keep updating time even when paused
        startTimeUpdate()
      } else if (event.data === window.YT.PlayerState.ENDED) {
        setIsPlaying(false)
        onPlayStateChange?.(false)
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
    <div style={{ display: 'none' }} className="plyr-youtube">
      <div ref={playerRef}>
        <div id={playerContainerId.current}></div>
      </div>
    </div>
  )
})

