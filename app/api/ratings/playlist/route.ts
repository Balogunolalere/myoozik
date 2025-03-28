import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { playlistId, rating } = await request.json()
    
    // Get the user's IP address from headers
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               '127.0.0.1'

    const supabase = createServerSupabaseClient()

    // Check if this IP has already rated this playlist
    const { data: existingRating } = await supabase
      .from("playlist_ratings")
      .select("id")
      .eq("playlist_id", playlistId)
      .eq("ip_address", ip)
      .maybeSingle()

    if (existingRating) {
      return NextResponse.json(
        { error: "already_rated" },
        { status: 400 }
      )
    }

    // Insert new rating with IP address
    const { error } = await supabase
      .from("playlist_ratings")
      .insert([{ 
        playlist_id: playlistId, 
        rating,
        ip_address: ip
      }])

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error submitting playlist rating:", error)
    return NextResponse.json(
      { error: "Failed to submit rating" },
      { status: 500 }
    )
  }
}