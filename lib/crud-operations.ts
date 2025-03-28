import { createClientSupabaseClient } from "./supabase"

// Playlist CRUD operations
export async function deletePlaylist(playlistId: number) {
  const supabase = createClientSupabaseClient()
  const { error } = await supabase.from("playlists").delete().eq("id", playlistId)

  if (error) throw error
  return true
}

export async function updatePlaylist(playlistId: number, data: { title?: string; description?: string }) {
  const supabase = createClientSupabaseClient()
  const { error } = await supabase.from("playlists").update(data).eq("id", playlistId)

  if (error) throw error
  return true
}

// Song CRUD operations
export async function deleteSong(songId: number) {
  const supabase = createClientSupabaseClient()
  const { error } = await supabase.from("songs").delete().eq("id", songId)

  if (error) throw error
  return true
}

export async function updateSong(songId: number, data: { title?: string; artist?: string }) {
  const supabase = createClientSupabaseClient()
  const { error } = await supabase.from("songs").update(data).eq("id", songId)

  if (error) throw error
  return true
}

// Rating CRUD operations
export async function deleteRating(ratingId: number, isPlaylistRating = false) {
  const supabase = createClientSupabaseClient()
  const table = isPlaylistRating ? "playlist_ratings" : "ratings"

  const { error } = await supabase.from(table).delete().eq("id", ratingId)

  if (error) throw error
  return true
}

export async function updateRating(ratingId: number, rating: number, isPlaylistRating = false) {
  const supabase = createClientSupabaseClient()
  const table = isPlaylistRating ? "playlist_ratings" : "ratings"

  const { error } = await supabase.from(table).update({ rating }).eq("id", ratingId)

  if (error) throw error
  return true
}

// Comment CRUD operations
export async function deleteComment(commentId: number, isPlaylistComment = false) {
  const supabase = createClientSupabaseClient()
  const table = isPlaylistComment ? "playlist_comments" : "comments"

  const { error } = await supabase.from(table).delete().eq("id", commentId)

  if (error) throw error
  return true
}

export async function updateComment(commentId: number, content: string, isPlaylistComment = false) {
  const supabase = createClientSupabaseClient()
  const table = isPlaylistComment ? "playlist_comments" : "comments"

  const { error } = await supabase.from(table).update({ content }).eq("id", commentId)

  if (error) throw error
  return true
}

