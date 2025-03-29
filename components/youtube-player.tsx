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
  onMuteStateChange?: (isMuted: boolean) => void
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
  cancel: () => void,
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
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isReady, setIsReady] = useState(false)
  
  // Store the video's current position when paused
  const pausedAtRef = useRef<Record<string, number>>({});
  
  const playerRef = useRef<HTMLDivElement>(null)
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null)
  const playerContainerId = useRef(`youtube-player-${Math.random().toString(36).substring(2, 9)}`)

  // Simple debounce implementation
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: any[]) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    togglePlay: () => {
      if (!player || !isReady) return;
      
      try {
        if (isPlaying) {
          // Save current position when pausing
          const currentPos = player.getCurrentTime() || 0;
          pausedAtRef.current[videoId] = currentPos;
          player.pauseVideo();
        } else {
          // When resuming, first seek to the stored position
          const resumePos = pausedAtRef.current[videoId] || 0;
          
          // Directly seek to the position and play
          player.seekTo(resumePos, true);
          
          // Use a very short delay to ensure seeking completes
          setTimeout(() => {
            if (player) player.playVideo();
          }, 10);
        }
      } catch (error) {
        console.error("Error toggling play:", error);
      }
    },
    stop: () => {
      if (!player || !isReady) return;
      
      try {
        // Reset position and pause
        pausedAtRef.current[videoId] = 0;
        player.seekTo(0);
        player.pauseVideo();
        setIsPlaying(false);
        onPlayStateChange?.(false);
        setCurrentTime(0);
      } catch (error) {
        console.error("Error stopping video:", error);
      }
    },
    cancel: () => {
      if (!player || !isReady) return;
      
      try {
        // Reset position and fully stop
        pausedAtRef.current[videoId] = 0;
        player.seekTo(0);
        player.stopVideo();
        setIsPlaying(false);
        onPlayStateChange?.(false);
        setCurrentTime(0);
      } catch (error) {
        console.error("Error canceling video:", error);
      }
    },
    toggleMute: () => {
      if (!player || !isReady) return;
      
      try {
        if (isMuted) {
          player.unMute();
          setIsMuted(false);
          onMuteStateChange?.(false);
        } else {
          player.mute();
          setIsMuted(true);
          onMuteStateChange?.(true);
        }
      } catch (error) {
        console.error("Error toggling mute:", error);
      }
    }
  }), [player, isReady, isPlaying, isMuted, videoId, onPlayStateChange, onMuteStateChange]);

  const clearTimeUpdateInterval = useCallback(() => {
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
      timeUpdateInterval.current = null;
    }
  }, []);

  const startTimeUpdate = useCallback(() => {
    clearTimeUpdateInterval();
    
    if (player && isReady) {
      // Update less frequently to reduce issues
      timeUpdateInterval.current = setInterval(() => {
        try {
          if (player.getCurrentTime && player.getDuration) {
            const time = player.getCurrentTime() || 0;
            const dur = player.getDuration() || 0;
            
            setCurrentTime(time);
            
            if (dur > 0 && dur !== Infinity) {
              setDuration(dur);
            }
          }
        } catch (error) {
          console.error("Error updating time:", error);
        }
      }, 500);
    }
  }, [player, isReady, clearTimeUpdateInterval]);

  // Initialize YouTube player
  useEffect(() => {
    let isMounted = true;
    
    const initPlayer = () => {
      if (!playerRef.current || !isMounted) return;
      
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
            playsinline: 1,
          },
          events: {
            onReady: (event) => {
              if (!isMounted) return;
              setIsReady(true);
              
              const dur = event.target.getDuration() || 0;
              setDuration(dur);
              
              if (isMuted) {
                event.target.mute();
              }
              
              if (autoplay) {
                event.target.playVideo();
              }
              
              startTimeUpdate();
            },
            onStateChange: (event) => {
              if (!isMounted) return;
              
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
                onPlayStateChange?.(true);
                startTimeUpdate();
              } 
              else if (event.data === window.YT.PlayerState.PAUSED) {
                // When paused naturally, save position
                if (player && player.getCurrentTime) {
                  pausedAtRef.current[videoId] = player.getCurrentTime() || 0;
                }
                
                setIsPlaying(false);
                onPlayStateChange?.(false);
                startTimeUpdate();
              } 
              else if (event.data === window.YT.PlayerState.ENDED) {
                pausedAtRef.current[videoId] = 0;
                setIsPlaying(false);
                onPlayStateChange?.(false);
                clearTimeUpdateInterval();
                
                if (onEnded) onEnded();
              }
            },
            onError: (event) => {
              console.error("YouTube player error:", event.data);
            },
          },
        });
        
        if (isMounted) {
          setPlayer(newPlayer);
        }
      } catch (error) {
        console.error("Error initializing player:", error);
      }
    };
    
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }
    
    return () => {
      isMounted = false;
      clearTimeUpdateInterval();
      
      if (player) {
        try {
          player.destroy();
        } catch (error) {
          console.error("Error destroying player:", error);
        }
      }
    };
  }, []);

  // Handle video ID changes
  useEffect(() => {
    if (!player || !isReady || !videoId) return;
    
    try {
      // Preserve current play state
      const wasPlaying = isPlaying;
      
      // Get any saved position for this video
      const resumePos = pausedAtRef.current[videoId] || 0;
      
      // Load new video
      player.loadVideoById({
        videoId: videoId,
        startSeconds: resumePos
      });
      
      // If we weren't playing, pause immediately after loading
      if (!wasPlaying) {
        setTimeout(() => {
          if (player) player.pauseVideo();
        }, 10);
      }
      
      // Apply current mute state
      if (isMuted) {
        player.mute();
      } else {
        player.unMute();
      }
    } catch (error) {
      console.error("Error loading video:", error);
    }
  }, [videoId, isReady, player]);

  return (
    <div style={{ display: 'none' }} className="plyr-youtube">
      <div ref={playerRef}>
        <div id={playerContainerId.current}></div>
      </div>
    </div>
  );
});

