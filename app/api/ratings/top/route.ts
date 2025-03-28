import { NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Get playlists with their average ratings and total ratings
    const { data, error } = await supabase
      .from('playlist_ratings')
      .select(`
        playlist_id,
        rating,
        playlists (
          id,
          title,
          youtube_playlist_id
        )
      `)

    if (error) throw error

    // Calculate average ratings and sort playlists
    const playlistMap = new Map()
    
    data.forEach((rating) => {
      if (!playlistMap.has(rating.playlist_id)) {
        playlistMap.set(rating.playlist_id, {
          ...rating.playlists,
          totalRatings: 0,
          ratingSum: 0
        })
      }
      
      const playlist = playlistMap.get(rating.playlist_id)
      playlist.totalRatings++
      playlist.ratingSum += rating.rating
    })

    const topPlaylists = Array.from(playlistMap.values())
      .map(playlist => ({
        ...playlist,
        averageRating: playlist.ratingSum / playlist.totalRatings
      }))
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 3)
      .map(({ id, title, youtube_playlist_id, totalRatings, averageRating }) => ({
        id,
        title,
        youtubeId: youtube_playlist_id,
        totalRatings,
        averageRating
      }))

    return NextResponse.json(topPlaylists)
  } catch (error) {
    console.error("Error fetching top rated playlists:", error)
    return NextResponse.json(
      { error: "Failed to fetch top rated playlists" },
      { status: 500 }
    )
  }
}