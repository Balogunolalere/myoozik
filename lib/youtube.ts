// YouTube API utility functions

export interface YouTubeVideo {
  id: string
  title: string
  artist?: string
  thumbnailUrl: string
  duration: string
}

export interface YouTubePlaylist {
  id: string
  title: string
  description?: string
  videos: YouTubeVideo[]
}

// Function to extract video ID from YouTube URL
export function extractVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[7].length === 11 ? match[7] : null
}

// Function to extract playlist ID from YouTube URL
export function extractPlaylistId(url: string): string | null {
  const regExp = /[&?]list=([a-zA-Z0-9_-]+)/
  const match = url.match(regExp)
  return match ? match[1] : null
}

// Function to format duration from ISO 8601 format
export function formatDuration(isoDuration: string): string {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)

  const hours = match && match[1] ? Number.parseInt(match[1].slice(0, -1)) : 0
  const minutes = match && match[2] ? Number.parseInt(match[2].slice(0, -1)) : 0
  const seconds = match && match[3] ? Number.parseInt(match[3].slice(0, -1)) : 0

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }
}

// Function to get video metadata using YouTube Data API
export async function getVideoMetadata(videoId: string): Promise<YouTubeVideo | null> {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${process.env.YOUTUBE_API_KEY}`,
    )

    const data = await response.json()

    if (data.items && data.items.length > 0) {
      const item = data.items[0]
      const title = item.snippet.title
      // Try to extract artist from title (common format: "Artist - Title")
      let artist = undefined
      if (title.includes(" - ")) {
        artist = title.split(" - ")[0].trim()
      }

      return {
        id: videoId,
        title: title,
        artist: artist,
        thumbnailUrl: item.snippet.thumbnails.high.url,
        duration: formatDuration(item.contentDetails.duration),
      }
    }

    return null
  } catch (error) {
    console.error("Error fetching video metadata:", error)
    return null
  }
}

// Function to get playlist metadata and videos using YouTube Data API
export async function getPlaylistMetadata(playlistId: string): Promise<YouTubePlaylist | null> {
  try {
    // First, get playlist details
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?id=${playlistId}&part=snippet&key=${process.env.YOUTUBE_API_KEY}`,
    )

    const playlistData = await playlistResponse.json()

    if (!playlistData.items || playlistData.items.length === 0) {
      return null
    }

    const playlistInfo = playlistData.items[0]

    // Then, get playlist items
    const itemsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&part=snippet,contentDetails&maxResults=50&key=${process.env.YOUTUBE_API_KEY}`,
    )

    const itemsData = await itemsResponse.json()

    if (!itemsData.items) {
      return {
        id: playlistId,
        title: playlistInfo.snippet.title,
        description: playlistInfo.snippet.description,
        videos: [],
      }
    }

    // Get video IDs
    const videoIds = itemsData.items.map((item: any) => item.contentDetails.videoId).join(",")

    // Get video details
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?id=${videoIds}&part=snippet,contentDetails&key=${process.env.YOUTUBE_API_KEY}`,
    )

    const videosData = await videosResponse.json()

    const videos = videosData.items.map((item: any) => {
      const title = item.snippet.title
      // Try to extract artist from title (common format: "Artist - Title")
      let artist = undefined
      if (title.includes(" - ")) {
        artist = title.split(" - ")[0].trim()
      }

      return {
        id: item.id,
        title: title,
        artist: artist,
        thumbnailUrl: item.snippet.thumbnails.high.url,
        duration: formatDuration(item.contentDetails.duration),
      }
    })

    return {
      id: playlistId,
      title: playlistInfo.snippet.title,
      description: playlistInfo.snippet.description,
      videos: videos,
    }
  } catch (error) {
    console.error("Error fetching playlist metadata:", error)
    return null
  }
}

