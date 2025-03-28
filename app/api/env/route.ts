import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    hasYouTubeApiKey: !!process.env.YOUTUBE_API_KEY,
  })
}

