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

// Create a global object to persist paused positions between component renders
const globalPausedPositions: Record<string, number> = {};

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
  
  // For debug purposes
  const debug = useRef({
    lastAction: "none",
    resumePosition: 0
  });
  
  const playerRef = useRef<HTMLDivElement>(null)
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null)
  const playerContainerId = useRef(`youtube-player-${Math.random().toString(36).substring(2, 9)}`)

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    togglePlay: () => {
      if (!player || !isReady) return;
      
      try {
        if (isPlaying) {
          // Save current position when pausing
          const currentPos = player.getCurrentTime() || 0;
          globalPausedPositions[videoId] = currentPos;
          
          debug.current.lastAction = "pause";
          debug.current.resumePosition = currentPos;
          
          console.log(`[DEBUG] Paused at ${currentPos} seconds`);
          player.pauseVideo();
        } else {
          // When resuming, seek to the stored position
          const resumePos = globalPausedPositions[videoId] || 0;
          
          debug.current.lastAction = "resume";
          debug.current.resumePosition = resumePos;
          
          console.log(`[DEBUG] Resuming from ${resumePos} seconds`);
          
          // Important: First pause to ensure we can properly seek
          player.pauseVideo();
          
          // Then seek to the saved position and play
          player.seekTo(resumePos, true);
          
          // Small delay to ensure the seek completes before playing
          setTimeout(() => {
            if (player) player.playVideo();
          }, 100);
        }
      } catch (error) {
        console.error("Error toggling play:", error);
      }
    },
    stop: () => {
      if (!player || !isReady) return;
      
      try {
        // Reset position and pause
        globalPausedPositions[videoId] = 0;
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
        globalPausedPositions[videoId] = 0;
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
      timeUpdateInterval.current = setInterval(() => {
        try {
          if (player.getCurrentTime && player.getDuration) {
            const time = player.getCurrentTime() || 0;
            const dur = player.getDuration() || 0;
            
            setCurrentTime(time);
            
            // If playing, continuously update the saved position
            if (isPlaying) {
              globalPausedPositions[videoId] = time;
            }
            
            if (dur > 0 && dur !== Infinity) {
              setDuration(dur);
            }
          }
        } catch (error) {
          console.error("Error updating time:", error);
        }
      }, 500);
    }
  }, [player, isReady, isPlaying, videoId, clearTimeUpdateInterval]);

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
              
              // If we have a saved position, seek to it
              const savedPos = globalPausedPositions[videoId] || 0;
              if (savedPos > 0) {
                console.log(`[DEBUG] onReady - seeking to saved position: ${savedPos}`);
                event.target.seekTo(savedPos, true);
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
                // When paused naturally (not through our togglePlay), save position
                if (player && player.getCurrentTime && debug.current.lastAction !== "pause") {
                  const pos = player.getCurrentTime() || 0;
                  globalPausedPositions[videoId] = pos;
                  console.log(`[DEBUG] Natural pause - saving position: ${pos}`);
                }
                
                setIsPlaying(false);
                onPlayStateChange?.(false);
                startTimeUpdate();
              } 
              else if (event.data === window.YT.PlayerState.ENDED) {
                globalPausedPositions[videoId] = 0;
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
    
    // Enable background playback
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => {
        if (player && isReady && !isPlaying) {
          player.playVideo();
        }
      });
      
      navigator.mediaSession.setActionHandler('pause', () => {
        if (player && isReady && isPlaying) {
          const currentPos = player.getCurrentTime() || 0;
          globalPausedPositions[videoId] = currentPos;
          player.pauseVideo();
        }
      });
      
      navigator.mediaSession.setActionHandler('stop', () => {
        if (player && isReady) {
          globalPausedPositions[videoId] = 0;
          player.stopVideo();
        }
      });
      
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        if (onPrevious && hasPrevious) onPrevious();
      });
      
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        if (onNext && hasNext) onNext();
      });
    }
    
    // Add wake lock for background playback when screen is off
    const enableWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          // @ts-ignore - WakeLock API may not be recognized by TypeScript
          const wakeLock = await navigator.wakeLock.request('screen');
          console.log('Wake Lock is active');
          
          // Release wake lock when component unmounts
          return () => {
            wakeLock.release()
              .then(() => console.log('Wake Lock released'))
              .catch((err) => console.error('Error releasing Wake Lock:', err));
          };
        }
      } catch (err) {
        console.error('Wake Lock error:', err);
      }
    };
    
    // Only attempt to enable wake lock when playing
    let wakeLockRelease: (() => void) | undefined;
    if (isPlaying) {
      enableWakeLock().then(release => {
        wakeLockRelease = release;
      });
    }
    
    return () => {
      isMounted = false;
      clearTimeUpdateInterval();
      
      // Release wake lock if active
      if (wakeLockRelease) {
        wakeLockRelease();
      }
      
      if (player) {
        try {
          // Save final position before unmounting
          if (isReady && player.getCurrentTime) {
            const finalPos = player.getCurrentTime() || 0;
            globalPausedPositions[videoId] = finalPos;
            console.log(`[DEBUG] Component unmounting - saving position: ${finalPos}`);
          }
          player.destroy();
        } catch (error) {
          console.error("Error destroying player:", error);
        }
      }
    };
  }, [isPlaying, onNext, onPrevious, hasNext, hasPrevious, videoId, autoplay, isMuted, startTimeUpdate]);

  // Handle video ID changes
  useEffect(() => {
    if (!player || !isReady || !videoId) return;
    
    try {
      console.log(`[DEBUG] videoId changed to ${videoId}`);
      
      // Preserve current play state
      const wasPlaying = isPlaying;
      
      // Get any saved position for this video
      const resumePos = globalPausedPositions[videoId] || 0;
      console.log(`[DEBUG] videoId change - resume position: ${resumePos}`);
      
      // First pause and load the video without autoplay
      player.cueVideoById({
        videoId: videoId,
        startSeconds: resumePos
      });
      
      // Then seek to ensure position and play if needed
      setTimeout(() => {
        if (!player) return;
        
        // Ensure position
        player.seekTo(resumePos, true);
        
        // Restore play state
        if (wasPlaying) {
          player.playVideo();
        }
        
        // Apply mute state
        if (isMuted) {
          player.mute();
        } else {
          player.unMute();
        }
      }, 100);
    } catch (error) {
      console.error("Error changing video:", error);
    }
  }, [videoId, isReady, player, isPlaying, isMuted]);

  // Set media metadata for background playback
  useEffect(() => {
    if ('mediaSession' in navigator && videoId) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: 'Playing Music',
        artist: 'Myoozik Player',
        album: 'Playlist',
        artwork: [
          { src: `/api/youtube/video/thumbnail/${videoId}`, sizes: '512x512', type: 'image/png' }
        ]
      });
    }
  }, [videoId]);

  return (
    <div style={{ display: 'none' }} className="plyr-youtube">
      <div ref={playerRef}>
        <div id={playerContainerId.current}></div>
      </div>
    </div>
  );
});

