import { useState } from "react";
import { useAudioPlayer } from "../context/AudioPlayerContext";

export default function TrackCard({
  track,
  playlists = [],
  playlistId,
  isInPlaylist = false,
  onDeleted,
}) {
  const { currentTrack, isPlaying, playTrack, togglePlay } =
    useAudioPlayer();

  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");

  const isCurrent = currentTrack?.audio_url === track.audio_url;

  const handlePlayPause = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  /* ➕ Add to playlist */
  const addToPlaylist = async () => {
    if (!selectedPlaylistId) {
      alert("Select a playlist");
      return;
    }

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

    alert("Added to playlist");
    setSelectedPlaylistId("");
  };

  /* 🗑 Delete from playlist */
 const deleteFromPlaylist = async () => {
  if (!playlistId) return;

  await fetch(
    `http://localhost:5001/playlists/${playlistId}/tracks/${track.external_id}`,
    {
      method: "DELETE",
    }
  );

  onDeleted?.();
};


  return (
    <div
      style={{
        border: isCurrent ? "2px solid #2563eb" : "1px solid #ddd",
        padding: "12px",
        borderRadius: "6px",
        marginBottom: "10px",
      }}
    >
      <h3>{track.title}</h3>
      <p>{track.artist}</p>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button onClick={handlePlayPause}>
          {isCurrent && isPlaying ? "⏸ Pause" : "▶ Play"}
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
            style={{ background: "red", color: "white" }}
          >
            🗑 Delete
          </button>
        )}
      </div>
    </div>
  );
}
