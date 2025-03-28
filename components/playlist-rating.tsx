"use client"
import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { motion } from "framer-motion"

interface PlaylistRatingProps {
  playlistId: number
  initialRating?: number
  totalRatings?: number
  averageRating?: number
  onRatingSubmit?: (rating: number) => void
}

export function PlaylistRating({
  playlistId,
  initialRating = 0,
  totalRatings = 0,
  averageRating = 0,
  onRatingSubmit,
}: PlaylistRatingProps) {
  const [rating, setRating] = useState(initialRating)
  const [hover, setHover] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClientSupabaseClient()

  useEffect(() => {
    // Check if user has already rated
    const checkExistingRating = async () => {
      const { data, error } = await supabase
        .from("playlist_ratings")
        .select("rating")
        .eq("playlist_id", playlistId)
        .is("ip_address", null)
        .maybeSingle()

      if (data?.rating) {
        setRating(Number(data.rating))
        setHasRated(true)
      }
    }

    checkExistingRating()
  }, [playlistId])

  const handleRating = async (value: number) => {
    if (isSubmitting || hasRated) return
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/ratings/playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          playlistId, 
          rating: value 
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        if (data.error === "already_rated") {
          setError("You have already rated this playlist")
          setHasRated(true)
          return
        }
        throw new Error(data.error || "Failed to submit rating")
      }

      setRating(value)
      setHasRated(true)
      
      if (onRatingSubmit) {
        onRatingSubmit(value)
      }
    } catch (error) {
      console.error("Error submitting rating:", error)
      setError("Failed to submit rating. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            disabled={isSubmitting || hasRated}
            onClick={() => handleRating(star)}
            onMouseEnter={() => !hasRated && setHover(star)}
            onMouseLeave={() => !hasRated && setHover(0)}
            whileHover={{ scale: !hasRated ? 1.2 : 1 }}
            whileTap={{ scale: !hasRated ? 0.9 : 1 }}
            className={`transition-transform ${hasRated ? "cursor-default" : "cursor-pointer"}`}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              size={32}
              className={`
                ${(hover || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                ${hasRated ? "opacity-80" : ""}
              `}
            />
          </motion.button>
        ))}
      </div>
      {error && (
        <motion.div
          className="text-sm text-red-600 mt-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {error}
        </motion.div>
      )}
      {totalRatings > 0 && (
        <div className="text-sm mt-1">
          <span className="font-bold">{averageRating.toFixed(1)}</span>
          <span className="text-gray-600">
            {" "}
            ({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})
          </span>
        </div>
      )}
      {hasRated && !error && (
        <motion.div
          className="text-sm text-green-600 mt-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Thanks for rating!
        </motion.div>
      )}
    </div>
  )
}

