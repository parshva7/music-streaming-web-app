import { useAudioPlayer } from "../context/AudioPlayerContext";

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    duration,
    seek,
  } = useAudioPlayer();

  if (!currentTrack) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#111",
        color: "#fff",
        padding: "12px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <div style={{ flex: 1 }}>
        <strong>{currentTrack.title}</strong>
        <div style={{ fontSize: "12px", color: "#aaa" }}>
          {currentTrack.artist}
        </div>
      </div>

      <button onClick={togglePlay}>
        {isPlaying ? "⏸ Pause" : "▶ Play"}
      </button>

      <input
        type="range"
        min="0"
        max={duration}
        value={progress}
        onChange={(e) => seek(e.target.value)}
        style={{ flex: 2 }}
      />
    </div>
  );
}
