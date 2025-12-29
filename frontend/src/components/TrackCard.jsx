import { useAudioPlayer } from "../context/AudioPlayerContext";

export default function TrackCard({ track }) {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
  } = useAudioPlayer();

  const isCurrent = currentTrack?.id === track.id;

  const handleClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        border: isCurrent ? "2px solid #2563eb" : "1px solid #ddd",
        padding: "12px",
        cursor: "pointer",
        borderRadius: "6px",
        background: isCurrent ? "#f0f6ff" : "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Track Info */}
      <div>
        <h3 style={{ margin: 0 }}>{track.title}</h3>
        <p style={{ margin: 0, color: "#555" }}>
          {track.artist}
        </p>
      </div>

      {/* Play / Pause Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        style={{
          padding: "6px 12px",
          borderRadius: "4px",
          border: "1px solid #ccc",
          cursor: "pointer",
          background: "#fff",
        }}
      >
        {isCurrent && isPlaying ? "⏸ Pause" : "▶ Play"}
      </button>
    </div>
  );
}
