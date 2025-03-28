"use client"
import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { motion } from "framer-motion"
import { VinylSpinner } from "@/components/vinyl-spinner"
import useInteractionStore from "@/lib/stores/interaction-store"

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
  const { hasRated, isSubmittingRating, error, submitRating, checkIfRated } = useInteractionStore()

  useEffect(() => {
    checkIfRated(playlistId)
  }, [playlistId])

  const handleRating = async (value: number) => {
    if (hasRated) return
    
    await submitRating(playlistId, value)
    setRating(value)
    
    if (onRatingSubmit) {
      onRatingSubmit(value)
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            disabled={isSubmittingRating || hasRated}
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
                ${(hover || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-white/70"}
                ${hasRated ? "opacity-80" : ""}
              `}
            />
          </motion.button>
        ))}
      </div>
      {isSubmittingRating && (
        <motion.div
          className="flex items-center gap-2 mt-2 text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VinylSpinner size={20} />
          <span>Submitting rating...</span>
        </motion.div>
      )}
      {error && (
        <motion.div
          className="text-sm text-white mt-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {error}
        </motion.div>
      )}
      {totalRatings > 0 && (
        <div className="text-sm mt-1 text-white">
          <span className="font-bold">{averageRating.toFixed(1)}</span>
          <span className="text-white/80">
            {" "}
            ({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})
          </span>
        </div>
      )}
      {hasRated && !error && (
        <motion.div
          className="text-sm text-white mt-1"
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

