import { type NextRequest, NextResponse } from "next/server"
import { getPlaylistMetadata } from "@/lib/youtube"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const playlistId = searchParams.get("id")

  if (!playlistId) {
    return NextResponse.json({ error: "Playlist ID is required" }, { status: 400 })
  }

  try {
    const playlistData = await getPlaylistMetadata(playlistId)

    if (!playlistData) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 })
    }

    return NextResponse.json(playlistData)
  } catch (error) {
    console.error("Error fetching playlist:", error)
    return NextResponse.json({ error: "Failed to fetch playlist data" }, { status: 500 })
  }
}

