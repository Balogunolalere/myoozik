"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send } from "lucide-react"

interface Comment {
  id: number
  content: string
  nickname: string
  created_at: string
}

interface CommentSectionProps {
  songId: number
}

export function CommentSection({ songId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [nickname, setNickname] = useState("Anonymous")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClientSupabaseClient()

  useEffect(() => {
    fetchComments()
  }, [songId])

  const fetchComments = async () => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("song_id", songId)
        .order("created_at", { ascending: false })

      if (error) throw error

      setComments(data || [])
    } catch (error) {
      console.error("Error fetching comments:", error)
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
        .from("comments")
        .insert([
          {
            song_id: songId,
            content: newComment.trim(),
            nickname: nickname.trim() || "Anonymous",
          },
        ])
        .select()

      if (error) throw error

      setNewComment("")
      fetchComments() // Refresh comments
    } catch (error) {
      console.error("Error submitting comment:", error)
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
    <div className="neobrutalist-container w-full">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
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
          />
        </div>
        <div className="flex gap-2">
          <Textarea
            placeholder="Add your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="neobrutalist-input w-full"
            rows={3}
          />
          <Button type="submit" disabled={isSubmitting || !newComment.trim()} className="neobrutalist-button self-end">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-center py-4">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-center py-4">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-4 border-black p-3">
              <div className="flex justify-between items-start">
                <h4 className="font-bold">{comment.nickname}</h4>
                <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

