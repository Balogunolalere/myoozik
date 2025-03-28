"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { motion } from "framer-motion"

interface RatingProps {
  songId: number
  initialRating?: number
  totalRatings?: number
  averageRating?: number
  onRatingSubmit?: (rating: number) => void
}

export function Rating({
  songId,
  initialRating = 0,
  totalRatings = 0,
  averageRating = 0,
  onRatingSubmit,
}: RatingProps) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasRated, setHasRated] = useState(false)
  const supabase = createClientSupabaseClient()

  const handleRating = async (value: number) => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from("ratings")
        .insert([{ song_id: songId, rating: value }])

      if (error) throw error

      setRating(value)
      setHasRated(true)

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
          <button
            key={star}
            type="button"
            disabled={isSubmitting || hasRated}
            onClick={() => handleRating(star)}
            onMouseEnter={() => !hasRated && setHover(star)}
            onMouseLeave={() => !hasRated && setHover(0)}
            className={`transition-transform ${hasRated ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              size={24}
              className={`
                ${(hover || rating) >= star ? "fill-[#FD6C6C] text-[#FD6C6C]" : "text-gray-300"}
                ${hasRated ? "opacity-80" : ""}
              `}
            />
          </button>
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

