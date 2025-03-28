-- Create playlist_ratings table
CREATE TABLE IF NOT EXISTS playlist_ratings (
  id SERIAL PRIMARY KEY,
  playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add ip_address column to playlist_ratings table
ALTER TABLE playlist_ratings ADD COLUMN ip_address TEXT;

-- Create playlist_comments table
CREATE TABLE IF NOT EXISTS playlist_comments (
  id SERIAL PRIMARY KEY,
  playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  nickname TEXT DEFAULT 'Anonymous',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

