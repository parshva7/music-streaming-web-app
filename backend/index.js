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
   (Service Role – Backend only)
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
app.get("/search", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Search query required" });
  }

  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(
        query
      )}&entity=song&limit=20`
    );

    const data = await response.json();

    const songs = data.results.map((song) => ({
      id: song.trackId,
      title: song.trackName,
      artist: song.artistName,
      audio_url: song.previewUrl,
      cover_url: song.artworkUrl100,
      duration: Math.floor(song.trackTimeMillis / 1000),
    }));

    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch songs" });
  }
});

/* =========================
   GET /categories
========================= */
app.get("/categories", async (req, res) => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

/* =========================
   GET /tracks
========================= */
/**
 * GET /tracks?search=
 */
app.get("/tracks", async (req, res) => {
  const search = req.query.search || "";

  let query = supabase
    .from("tracks")
    .select(`
      id,
      title,
      artist,
      audio_url,
      cover_url,
      duration,
      categories (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,artist.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});


/* =========================
   GET /podcasts
========================= */
app.get("/podcasts", async (req, res) => {
  const { data, error } = await supabase
    .from("podcasts")
    .select(`
      id,
      title,
      host,
      audio_url,
      cover_url,
      categories (
        id,
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

/* =========================
   Server Start
========================= */
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
