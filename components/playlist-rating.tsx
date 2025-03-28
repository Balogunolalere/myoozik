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

interface RatingData {
  id: number
  rating: number
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
  const [userRating, setUserRating] = useState<RatingData | null>(null)

  const supabase = createClientSupabaseClient()

  useEffect(() => {
    checkExistingRating()
  }, [playlistId])

  const checkExistingRating = async () => {
    try {
      // Check if user has already rated this playlist (based on IP)
      const { data, error } = await supabase
        .from("playlist_ratings")
        .select("id, rating")
        .eq("playlist_id", playlistId)
        .order("created_at", { ascending: false })
        .limit(1)

      if (error) throw error

      if (data && data.length > 0) {
        setUserRating(data[0])
        setRating(data[0].rating)
        setHasRated(true)
      }
    } catch (error) {
      console.error("Error checking existing rating:", error)
    }
  }

  const handleRating = async (value: number) => {
    if (isSubmitting || hasRated) return

    setIsSubmitting(true)

    try {
      // Create new rating
      const { error } = await supabase.from("playlist_ratings").insert([{ playlist_id: playlistId, rating: value }])

      if (error) throw error

      setRating(value)
      setHasRated(true)
      checkExistingRating() // Refresh user rating data

      if (onRatingSubmit) {
        onRatingSubmit(value)
      }
    } catch (error) {
      console.error("Error submitting rating:", error)
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

      {totalRatings > 0 && (
        <div className="text-sm mt-1">
          <span className="font-bold">{averageRating.toFixed(1)}</span>
          <span className="text-gray-600">
            {" "}
            ({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})
          </span>
        </div>
      )}

      {hasRated && (
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

