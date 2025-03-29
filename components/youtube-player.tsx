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

// Define YouTube API event types to address TypeScript errors
interface YouTubeEvent {
  target: any;
  data?: number;
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
  const [isResumingPlay, setIsResumingPlay] = useState(false)
  const [isChangingVideo, setIsChangingVideo] = useState(false)
  
  // Store the video's current position when paused
  const pausedAtRef = useRef<Record<string, number>>({});
  const currentVideoIdRef = useRef<string>(videoId);
  const lastActionTimeRef = useRef<number>(0);
  
  const playerRef = useRef<HTMLDivElement>(null)
  const timeUpdateInterval = useRef<NodeJS.Timeout | null>(null)
  const playerContainerId = useRef(`youtube-player-${Math.random().toString(36).substring(2, 9)}`)

  // Debounce and throttle implementation
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: any[]) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  const throttle = useCallback((func: Function, limit: number) => {
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastActionTimeRef.current >= limit) {
        lastActionTimeRef.current = now;
        func(...args);
      }
    };
  }, []);

  // Update current video ID ref when prop changes
  useEffect(() => {
    currentVideoIdRef.current = videoId;
  }, [videoId]);

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    togglePlay: throttle(() => {
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
          
          // Set resuming flag to prevent state conflicts
          setIsResumingPlay(true);
          
          // Directly seek to the position
          player.seekTo(resumePos, true);
          
          // Play after a brief delay to ensure the seek completes
          setTimeout(() => {
            if (player) {
              player.playVideo();
              // Set the playing state directly to

