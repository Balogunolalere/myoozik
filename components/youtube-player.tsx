"use client"
import { forwardRef, useEffect, useRef, useCallback, useImperativeHandle, useState } from "react"

interface YouTubePlayerProps {
  videoId: string
  onEnded?: () => void
  autoplay?: boolean
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
  onPlayStateChange?: (isPlaying: boolean) => void
  onMuteStateChange?: (isMuted: boolean) => void
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

interface YouTubeEvent {
  target: any
  data?: number
}

let ytApiPromise: Promise<void> | null = null

function loadYouTubeApi(): Promise<void> {
  if (ytApiPromise) return ytApiPromise
  
  ytApiPromise = new Promise((resolve) => {
    if (window.YT) {
      resolve()
      return
    }

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'

    window.onYouTubeIframeAPIReady = () => {
      resolve()
    }

    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
  })

  return ytApiPromise
}

export const YouTubePlayer = forwardRef<{
  togglePlay: () => void
  stop: () => void
  cancel: () => void
  toggleMute: () => void
}, YouTubePlayerProps>(({
  videoId,
  onEnded,
  autoplay = false,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  onPlayStateChange,
  onMuteStateChange
}, ref) => {
  const [player, setPlayer] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(autoplay)
  const [isMuted, setIsMuted] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [hasError, setHasError] = useState(false)
  
  const playerContainerId = useRef(`youtube-player-${Math.random().toString(36).substring(2, 9)}`)
  const playerRef = useRef<HTMLDivElement>(null)
  const currentVideoIdRef = useRef<string>(videoId)
  
  useEffect(() => {
    currentVideoIdRef.current = videoId
  }, [videoId])

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    togglePlay: () => {
      if (!player || !isReady || hasError) return
      
      try {
        if (isPlaying) {
          player.pauseVideo()
        } else {
          player.playVideo()
        }
      } catch (error) {
        console.error("Error toggling play:", error)
      }
    },
    stop: () => {
      if (!player || !isReady || hasError) return
      
      try {
        player.seekTo(0)
        player.pauseVideo()
      } catch (error) {
        console.error("Error stopping video:", error)
      }
    },
    cancel: () => {
      if (!player || !isReady || hasError) return
      
      try {
        player.seekTo(0)
        player.stopVideo()
      } catch (error) {
        console.error("Error canceling video:", error)
      }
    },
    toggleMute: () => {
      if (!player || !isReady || hasError) return
      
      try {
        if (isMuted) {
          player.unMute()
          setIsMuted(false)
          onMuteStateChange?.(false)
        } else {
          player.mute()
          setIsMuted(true)
          onMuteStateChange?.(true)
        }
      } catch (error) {
        console.error("Error toggling mute:", error)
      }
    }
  }), [player, isReady, isPlaying, isMuted, hasError, onMuteStateChange])

  // Initialize YouTube player
  useEffect(() => {
    let isMounted = true
    
    async function initPlayer() {
      if (!playerRef.current || !isMounted) return
      
      try {
        await loadYouTubeApi()
        
        if (!isMounted) return

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
            playsinline: 1,
          },
          events: {
            onReady: (event: YouTubeEvent) => {
              if (!isMounted) return
              
              setPlayer(event.target)
              setIsReady(true)
              setHasError(false)
              
              if (isMuted) {
                event.target.mute()
              }
              
              if (autoplay) {
                event.target.playVideo()
              }
            },
            onStateChange: (event: YouTubeEvent) => {
              if (!isMounted) return
              
              switch (event.data) {
                case window.YT.PlayerState.PLAYING:
                  setIsPlaying(true)
                  onPlayStateChange?.(true)
                  break
                case window.YT.PlayerState.PAUSED:
                  setIsPlaying(false)
                  onPlayStateChange?.(false)
                  break
                case window.YT.PlayerState.ENDED:
                  setIsPlaying(false)
                  onPlayStateChange?.(false)
                  onEnded?.()
                  break
              }
            },
            onError: (event: YouTubeEvent) => {
              console.error("YouTube player error:", event.data)
              setHasError(true)
              setIsPlaying(false)
              onPlayStateChange?.(false)
            },
          },
        })
      } catch (error) {
        console.error("Error initializing player:", error)
        setHasError(true)
      }
    }

    initPlayer()
    
    return () => {
      isMounted = false
      if (player?.destroy) {
        try {
          player.destroy()
        } catch (error) {
          console.error("Error destroying player:", error)
        }
      }
    }
  }, [])

  // Handle video ID changes
  useEffect(() => {
    if (!player || !isReady || !videoId || hasError) return
    
    try {
      const wasPlaying = isPlaying
      
      // Load new video
      player.loadVideoById({
        videoId: videoId,
        startSeconds: 0
      })
      
      // If we weren't playing, pause immediately after loading
      if (!wasPlaying) {
        // Small delay to ensure video loads before pausing
        setTimeout(() => {
          if (player?.pauseVideo) {
            player.pauseVideo()
          }
        }, 100)
      }
      
      // Apply mute state
      if (isMuted) {
        player.mute()
      } else {
        player.unMute()
      }
    } catch (error) {
      console.error("Error loading video:", error)
      setHasError(true)
    }
  }, [videoId, isReady, player, isPlaying, isMuted, hasError])

  return (
    <div style={{ display: 'none' }} className="plyr-youtube">
      <div ref={playerRef}>
        <div id={playerContainerId.current}></div>
      </div>
    </div>
  )
})

YouTubePlayer.displayName = "YouTubePlayer"

