import { useEffect, useState } from "react";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import { useAuth } from "../context/AuthContext";

export default function Podcasts() {
  const { user } = useAuth();
  const { playQueue } = useAudioPlayer();

  const [search, setSearch] = useState("");
  const [podcasts, setPodcasts] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [likedMap, setLikedMap] = useState({});

  /* 🔍 Debounced search */
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPodcasts();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  /* 🎧 Fetch podcasts */
  const fetchPodcasts = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5001/podcasts?q=${encodeURIComponent(search)}`
      );
      const data = await res.json();

      if (Array.isArray(data)) {
        setPodcasts(data);
      } else {
        setPodcasts([]);
      }
    } catch (err) {
      console.error("Failed to fetch podcasts", err);
      setPodcasts([]);
    } finally {
      setLoading(false);
    }
  };

  /* 📂 Fetch playlists */
  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:5001/playlists/${user.id}`)
      .then((res) => res.json())
      .then((data) => setPlaylists(Array.isArray(data) ? data : []));
  }, [user]);

  /* ❤️ Like / Unlike podcast */
  const toggleLike = async (podcast) => {
    if (!user) return;

    const id = podcast.external_id || podcast.id;

    if (likedMap[id]) {
      await fetch(
        `http://localhost:5001/favorites/${user.id}/${id}`,
        { method: "DELETE" }
      );
      setLikedMap((p) => ({ ...p, [id]: false }));
    } else {
      await fetch("http://localhost:5001/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          external_id: id,
          title: podcast.title,
          artist: podcast.artist,
          audio_url: podcast.audio_url,
          cover_url: podcast.cover_url || "",
          duration: podcast.duration || 0,
        }),
      });
      setLikedMap((p) => ({ ...p, [id]: true }));
    }
  };

  /* ➕ Add podcast to playlist */
  const addToPlaylist = async (podcast) => {
    if (!selectedPlaylist) {
      alert("Select a playlist");
      return;
    }

    await fetch(
      `http://localhost:5001/playlists/${selectedPlaylist}/tracks`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          external_id: podcast.external_id || podcast.id,
          title: podcast.title,
          artist: podcast.artist,
          audio_url: podcast.audio_url,
          cover_url: podcast.cover_url || "",
          duration: podcast.duration || 0,
        }),
      }
    );

    alert("Podcast added to playlist");
    setSelectedPlaylist("");
  };

  return (
    <div style={{ padding: 20, paddingBottom: 120 }}>
      <h2>🎧 Browse Podcasts</h2>

      {/* Search */}
      <input
        placeholder="Search podcasts..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 16,
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />

      {loading && <p>Loading podcasts...</p>}
      {!loading && podcasts.length === 0 && <p>No podcasts found</p>}

      {/* Podcast list */}
      {podcasts.map((podcast, index) => {
        const id = podcast.external_id || podcast.id;

        return (
          <div
            key={id}
            style={{
              border: "1px solid #ddd",
              padding: 12,
              borderRadius: 6,
              marginBottom: 10,
            }}
          >
            <h3 style={{ marginBottom: 4 }}>{podcast.title}</h3>
            <p style={{ marginTop: 0, color: "#555" }}>
              {podcast.artist}
            </p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {/* ▶ Play */}
              <button onClick={() => playQueue(podcasts, index)}>
                ▶ Play
              </button>

              {/* ❤️ Like */}
              <button onClick={() => toggleLike(podcast)}>
                {likedMap[id] ? "❤️ Liked" : "🤍 Like"}
              </button>

              {/* ➕ Add to playlist */}
              {playlists.length > 0 && (
                <>
                  <select
                    value={selectedPlaylist}
                    onChange={(e) =>
                      setSelectedPlaylist(e.target.value)
                    }
                  >
                    <option value="">Add to playlist</option>
                    {playlists.map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name}
                      </option>
                    ))}
                  </select>

                  <button onClick={() => addToPlaylist(podcast)}>
                    ➕
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
