import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import fetch from "node-fetch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

/* =========================
   Middleware
========================= */
app.use(cors());
app.use(express.json());

/* =========================
   Supabase Client
========================= */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* =========================
   Health Check
========================= */
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

/* =========================
   iTunes Search
========================= */
app.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query required" });

  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(
        query
      )}&entity=song&limit=20`
    );

    const json = await response.json();

    const songs = json.results.map((s) => ({
      external_id: String(s.trackId),
      title: s.trackName,
      artist: s.artistName,
      audio_url: s.previewUrl,
      cover_url: s.artworkUrl100,
      duration: Math.floor(s.trackTimeMillis / 1000),
    }));

    res.json(songs);
  } catch {
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

/* =========================
   Playlists
========================= */

/* Create playlist */
app.post("/playlists", async (req, res) => {
  const { name, user_id } = req.body;

  if (!name || !user_id) {
    return res.status(400).json({ error: "name and user_id required" });
  }

  const { data, error } = await supabase
    .from("playlists")
    .insert({ name, user_id })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

/* Get user playlists */
app.get("/playlists/:userId", async (req, res) => {
  const { userId } = req.params;

  const { data, error } = await supabase
    .from("playlists")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

/* =========================
   Playlist Tracks
========================= */

/* Add song to playlist */
app.post("/playlists/:playlistId/tracks", async (req, res) => {
  const { playlistId } = req.params;
  const {
    external_id,
    title,
    artist,
    audio_url,
    cover_url,
    duration,
  } = req.body;

  if (!external_id || !title) {
    return res.status(400).json({ error: "Invalid track data" });
  }

  const { error } = await supabase
    .from("playlist_tracks")
    .insert({
      playlist_id: playlistId,
      external_id,
      title,
      artist,
      audio_url,
      cover_url,
      duration,
    });

  if (error) return res.status(500).json({ error: error.message });

  res.json({ success: true });
});

/* Get songs in a playlist */
app.get("/playlists/:playlistId/tracks", async (req, res) => {
  const { playlistId } = req.params;

  const { data, error } = await supabase
    .from("playlist_tracks")
    .select("*")
    .eq("playlist_id", playlistId)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

/* Delete song from playlist */
/* Delete track from playlist */
app.delete("/playlists/:playlistId/tracks/:externalId", async (req, res) => {
  const { playlistId, externalId } = req.params;

  const { error } = await supabase
    .from("playlist_tracks")
    .delete()
    .eq("playlist_id", playlistId)
    .eq("external_id", externalId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
});


/* =========================
   Server Start
========================= */
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
