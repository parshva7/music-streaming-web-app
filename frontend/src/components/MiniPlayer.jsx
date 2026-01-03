import { useAudioPlayer } from "../context/AudioPlayerContext";
import { useAuth } from "../context/AuthContext";

/* ⏱ helper */
const formatTime = (sec = 0) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function MiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    togglePlay,
    progress,
    duration,
    seek,
    playNext,
    playPrev,
    toggleShuffle,
    toggleRepeat,
    shuffle,
    repeat,
    setVolume,
    volume,
  } = useAudioPlayer();

  const { user } = useAuth();

  // ❌ hide if logged out or nothing playing
  if (!user || !currentTrack) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#111",
        color: "#fff",
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        zIndex: 1000,
      }}
    >
      {/* 🎧 Track / Podcast info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <strong style={{ fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {currentTrack.title}
        </strong>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          {currentTrack.artist}
        </div>
      </div>

      {/* ⏮ ▶ ⏭ */}
      <button onClick={playPrev}>⏮</button>
      <button onClick={togglePlay}>
        {isPlaying ? "⏸" : "▶"}
      </button>
      <button onClick={playNext}>⏭</button>

      {/* ⏱ time + seek */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 2 }}>
        <span style={{ fontSize: 12 }}>
          {formatTime(progress)}
        </span>

        <input
          type="range"
          min={0}
          max={duration || 0}
          value={progress}
          onChange={(e) => seek(Number(e.target.value))}
          style={{ flex: 1 }}
        />

        <span style={{ fontSize: 12 }}>
          {formatTime(duration)}
        </span>
      </div>

      {/* 🔀 🔁 */}
      <button
        onClick={toggleShuffle}
        style={{ opacity: shuffle ? 1 : 0.5 }}
      >
        🔀
      </button>

      <button
        onClick={toggleRepeat}
        style={{ opacity: repeat ? 1 : 0.5 }}
      >
        🔁
      </button>

      {/* 🔊 volume */}
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        style={{ width: 80 }}
      />
    </div>
  );
}
