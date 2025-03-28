import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { isPlaylistRating } = await request.json()
    const table = isPlaylistRating ? "playlist_ratings" : "ratings"

    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from(table).delete().eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting rating:", error)
    return NextResponse.json({ error: "Failed to delete rating" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const { rating, isPlaylistRating } = data
    const table = isPlaylistRating ? "playlist_ratings" : "ratings"

    const supabase = createServerSupabaseClient()
    const { error } = await supabase.from(table).update({ rating }).eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating rating:", error)
    return NextResponse.json({ error: "Failed to update rating" }, { status: 500 })
  }
}

