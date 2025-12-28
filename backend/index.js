import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client (backend – service role)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Health check
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

/**
 * GET /categories
 */
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

/**
 * GET /tracks
 */
app.get("/tracks", async (req, res) => {
  const { data, error } = await supabase
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

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

/**
 * GET /podcasts
 */
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

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
