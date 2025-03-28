import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { isPlaylistComment } = await request.json()
    const table = isPlaylistComment ? "playlist_comments" : "comments"

    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from(table).delete().eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const { content, isPlaylistComment } = data
    const table = isPlaylistComment ? "playlist_comments" : "comments"

    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from(table).update({ content }).eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating comment:", error)
    return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
  }
}

