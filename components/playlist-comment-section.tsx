"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { VinylSpinner } from "@/components/vinyl-spinner"

interface Comment {
  id: number
  content: string
  nickname: string
  created_at: string
}

interface PlaylistCommentSectionProps {
  playlistId: number
}

export function PlaylistCommentSection({ playlistId }: PlaylistCommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [nickname, setNickname] = useState("Anonymous")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const supabase = createClientSupabaseClient()

  useEffect(() => {
    fetchComments()
  }, [playlistId])

  const fetchComments = async () => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("playlist_comments")
        .select("*")
        .eq("playlist_id", playlistId)
        .order("created_at", { ascending: false })
        .returns<Comment[]>()

      if (error) throw error

      setComments(data || [])
    } catch (error) {
      console.error("Error fetching comments:", error)
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      const { data, error } = await supabase
        .from("playlist_comments")
        .insert([
          {
            playlist_id: playlistId,
            content: newComment.trim(),
            nickname: nickname.trim() || "Anonymous",
          },
        ])
        .select()

      if (error) throw error

      setNewComment("")
      fetchComments() // Refresh comments
      toast({
        title: "Success",
        description: "Comment posted successfully!",
      })
    } catch (error) {
      console.error("Error submitting comment:", error)
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <motion.div
      className="neobrutalist-container w-full bg-[#FD6C6C]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-marker)" }}>
        <MessageSquare className="h-5 w-5" />
        Comments
      </h3>

      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex gap-2 mb-2">
          <Input
            type="text"
            placeholder="Nickname (optional)"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="neobrutalist-input max-w-xs"
            maxLength={30}
            style={{ fontFamily: "var(--font-indie)" }}
          />
        </div>
        <div className="flex gap-2">
          <Textarea
            placeholder="Add your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="neobrutalist-input w-full"
            rows={3}
            style={{ fontFamily: "var(--font-indie)" }}
          />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="neobrutalist-button self-end"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <VinylSpinner size={20} />
                  <span>Posting...</span>
                </div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </motion.div>
        </div>
      </form>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <VinylSpinner size={48} />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center py-4" style={{ fontFamily: "var(--font-indie)" }}>
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                className="border-4 border-black p-3 bg-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold" style={{ fontFamily: "var(--font-marker)" }}>
                    {comment.nickname}
                  </h4>
                  <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                </div>
                <p className="mt-1 whitespace-pre-wrap" style={{ fontFamily: "var(--font-indie)" }}>
                  {comment.content}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
}

