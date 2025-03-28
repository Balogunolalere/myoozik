"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
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
  const playerRef = useRef<HTMLDivElement>(null)
  const playerContainerId = `youtube-player-${Math.random().toString(36).substring(2, 9)}`

  useEffect(() => {
    // Load YouTube API
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
      if (player) {
        player.destroy()
      }
    }
  }, [])

  useEffect(() => {
    if (player && videoId) {
      player.loadVideoById(videoId)
      if (isPlaying) {
        player.playVideo()
      } else {
        player.pauseVideo()
      }
    }
  }, [videoId])

  const initializePlayer = () => {
    if (!playerRef.current) return

    const newPlayer = new window.YT.Player(playerContainerId, {
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
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    })

    setPlayer(newPlayer)
  }

  const onPlayerReady = (event: any) => {
    setDuration(event.target.getDuration())
    if (autoplay) {
      event.target.playVideo()
    }
  }

  const onPlayerStateChange = (event: any) => {
    if (event.data === window.YT.PlayerState.PLAYING) {
      setIsPlaying(true)
      startTimeUpdate()
    } else {
      setIsPlaying(false)
      stopTimeUpdate()
    }

    if (event.data === window.YT.PlayerState.ENDED) {
      if (onEnded) onEnded()
    }
  }

  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null)

  const startTimeUpdate = () => {
    if (timeUpdateInterval.current) clearInterval(timeUpdateInterval.current)
    timeUpdateInterval.current = setInterval(() => {
      if (player) {
        setCurrentTime(player.getCurrentTime())
      }
    }, 1000)
  }

  const stopTimeUpdate = () => {
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current)
      timeUpdateInterval.current = null
    }
  }

  const togglePlay = () => {
    if (player) {
      if (isPlaying) {
        player.pauseVideo()
      } else {
        player.playVideo()
      }
    }
  }

  const toggleMute = () => {
    if (player) {
      if (isMuted) {
        player.unMute()
        setIsMuted(false)
      } else {
        player.mute()
        setIsMuted(true)
      }
    }
  }

  const handleSeek = (value: number[]) => {
    const seekTime = value[0]
    if (player) {
      player.seekTo(seekTime)
      setCurrentTime(seekTime)
    }
  }

  const formatTime = (seconds: number) => {
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
        <div id={playerContainerId}></div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration}
            step={1}
            onValueChange={handleSeek}
            className="w-full"
          />
          <span className="text-sm font-mono whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
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

