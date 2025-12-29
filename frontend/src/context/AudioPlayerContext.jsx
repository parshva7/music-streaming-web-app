import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const AudioPlayerContext = createContext(null);

export const AudioPlayerProvider = ({ children }) => {
  const audioRef = useRef(new Audio());

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // ▶ Play a new track
  const playTrack = (track) => {
    if (!track?.audio_url) {
      alert("No audio preview available for this track");
      return;
    }

    const audio = audioRef.current;

    // New track selected
    if (!currentTrack || currentTrack.id !== track.id) {
      audio.pause();
      audio.src = track.audio_url;
      audio.load();
      setCurrentTrack(track);
    }

    audio.play();
    setIsPlaying(true);
  };

  // ⏯ Toggle play / pause
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!currentTrack) return;

    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  // ⏩ Seek audio
  const seek = (time) => {
    audioRef.current.currentTime = time;
  };

  // 🎧 Audio listeners
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        duration,
        playTrack,
        togglePlay,
        seek,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

// Hook
export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error(
      "useAudioPlayer must be used inside AudioPlayerProvider"
    );
  }
  return context;
};
