"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { updateSong } from "@/lib/crud-operations"
import { Loader2, Save, X } from "lucide-react"

interface EditSongFormProps {
  songId: number
  initialTitle: string
  initialArtist?: string
  onSave: () => void
  onCancel: () => void
}

export function EditSongForm({ songId, initialTitle, initialArtist = "", onSave, onCancel }: EditSongFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [artist, setArtist] = useState(initialArtist || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      await updateSong(songId, {
        title: title.trim(),
        artist: artist.trim() || null,
      })

      onSave()
    } catch (error) {
      console.error("Error updating song:", error)
      setError("Failed to update song. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      className="neobrutalist-container w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block font-bold mb-2" style={{ fontFamily: "var(--font-marker)" }}>
            Song Title
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="neobrutalist-input"
            required
            style={{ fontFamily: "var(--font-indie)" }}
          />
        </div>

        <div>
          <label htmlFor="artist" className="block font-bold mb-2" style={{ fontFamily: "var(--font-marker)" }}>
            Artist (optional)
          </label>
          <Input
            id="artist"
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="neobrutalist-input"
            style={{ fontFamily: "var(--font-indie)" }}
          />
        </div>

        {error && (
          <motion.div
            className="bg-red-100 border-4 border-red-500 p-3 text-red-700"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.div>
        )}

        <div className="flex justify-end gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button type="button" onClick={onCancel} className="neobrutalist-button bg-gray-200">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button type="submit" disabled={isSubmitting || !title.trim()} className="neobrutalist-button">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </form>
    </motion.div>
  )
}

