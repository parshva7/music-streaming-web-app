import { useState } from "react";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import { useAuth } from "../context/AuthContext";

export default function TrackCard({
  track,
  tracks = null,
  index = null,
  playlists = [],
  playlistId = null,
  isInPlaylist = false,
  isFavorite = false,
  onDeleted,
  onFavoriteChange,
}) {
  const { user } = useAuth();
  const {
    currentTrack,
    isPlaying,
    playQueue,
    togglePlay,
  } = useAudioPlayer();

  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [liked, setLiked] = useState(isFavorite);

  const isCurrent =
    currentTrack?.audio_url === track.audio_url;

  /* ▶ Play / ⏸ Pause */
const {  playTrack } =
  useAudioPlayer();

const handlePlayPause = () => {
  if (isCurrent) {
    togglePlay();
  } else if (tracks && typeof index === "number") {
    playQueue(tracks, index);   // ✅ QUEUE MODE
  } else {
    playTrack(track);           // fallback
  }
};


  /* ➕ Add to playlist */
  const addToPlaylist = async () => {
    if (!selectedPlaylistId) return alert("Select a playlist");

    await fetch(
      `http://localhost:5001/playlists/${selectedPlaylistId}/tracks`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          external_id: track.external_id || track.id,
          title: track.title,
          artist: track.artist,
          audio_url: track.audio_url,
          cover_url: track.cover_url,
          duration: track.duration,
        }),
      }
    );

    setSelectedPlaylistId("");
    alert("Added to playlist");
  };

  /* 🗑 Delete from playlist */
  const deleteFromPlaylist = async () => {
    if (!playlistId) return;

    await fetch(
      `http://localhost:5001/playlists/${playlistId}/tracks/${track.external_id || track.id}`,
      { method: "DELETE" }
    );

    onDeleted?.();
  };

  /* ❤️ Like / Unlike */
  const toggleFavorite = async () => {
    if (!user) return;

    if (liked) {
      await fetch(
        `http://localhost:5001/favorites/${user.id}/${track.external_id || track.id}`,
        { method: "DELETE" }
      );
      setLiked(false);
    } else {
      await fetch("http://localhost:5001/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          external_id: track.external_id || track.id,
          title: track.title,
          artist: track.artist,
          audio_url: track.audio_url,
          cover_url: track.cover_url,
          duration: track.duration,
        }),
      });
      setLiked(true);
    }

    onFavoriteChange?.();
  };

  return (
    <div
      style={{
        border: isCurrent ? "2px solid #2563eb" : "1px solid #ddd",
        padding: 12,
        borderRadius: 6,
        marginBottom: 10,
      }}
    >
      <h3>{track.title}</h3>
      <p style={{ color: "#555" }}>{track.artist}</p>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button onClick={handlePlayPause}>
          {isCurrent && isPlaying ? "⏸ Pause" : "▶ Play"}
        </button>

        <button onClick={toggleFavorite}>
          {liked ? "❤️ Liked" : "🤍 Like"}
        </button>

        {!isInPlaylist && playlists.length > 0 && (
          <>
            <select
              value={selectedPlaylistId}
              onChange={(e) => setSelectedPlaylistId(e.target.value)}
            >
              <option value="">Add to playlist</option>
              {playlists.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.name}
                </option>
              ))}
            </select>
            <button onClick={addToPlaylist}>➕</button>
          </>
        )}

        {isInPlaylist && (
          <button
            onClick={deleteFromPlaylist}
            style={{
              background: "#dc2626",
              color: "white",
              border: "none",
              padding: "6px 10px",
              borderRadius: 4,
            }}
          >
            🗑 Delete
          </button>
        )}
      </div>
    </div>
  );
}
