"use client"

import { forwardRef, useEffect, useRef, useImperativeHandle, useState } from "react"

interface YouTubePlayerProps {
  videoId: string
  onEnded?: () => void
  autoplay?: boolean
  onPlayStateChange?: (isPlaying: boolean) => void
  onMuteStateChange?: (isMuted: boolean) => void
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

export const YouTubePlayer = forwardRef<{
  play: () => void
  pause: () => void
  toggleMute: () => void
}, YouTubePlayerProps>(({
  videoId,
  onEnded,
  autoplay = false,
  onPlayStateChange,
  onMuteStateChange
}, ref) => {
  const [player, setPlayer] = useState<any>(null)
  const [isReady, setIsReady] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const playerContainerId = useRef(`youtube-player-${Math.random().toString(36).slice(2)}`)

  // Load YouTube API
  useEffect(() => {
    if (window.YT) return

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      const newPlayer = new window.YT.Player(playerContainerId.current, {
        videoId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 0,
          disablekb: 1,
          enablejsapi: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            setPlayer(event.target)
            setIsReady(true)
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              onPlayStateChange?.(true)
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              onPlayStateChange?.(false)
            } else if (event.data === window.YT.PlayerState.ENDED) {
              onPlayStateChange?.(false)
              onEnded?.()
            }
          }
        }
      })
    }
  }, [])

  // Handle video changes
  useEffect(() => {
    if (!player || !isReady) return
    player.loadVideoById(videoId)
  }, [videoId, player, isReady])

  // Expose controls through ref
  useImperativeHandle(ref, () => ({
    play: () => {
      if (!player || !isReady) return
      player.playVideo()
    },
    pause: () => {
      if (!player || !isReady) return
      player.pauseVideo()
    },
    toggleMute: () => {
      if (!player || !isReady) return
      if (isMuted) {
        player.unMute()
        setIsMuted(false)
        onMuteStateChange?.(false)
      } else {
        player.mute()
        setIsMuted(true)
        onMuteStateChange?.(true)
      }
    }
  }), [player, isReady, isMuted, onMuteStateChange])

  return (
    <div style={{ display: 'none' }} className="youtube-player">
      <div id={playerContainerId.current}></div>
    </div>
  )
})

YouTubePlayer.displayName = "YouTubePlayer"

