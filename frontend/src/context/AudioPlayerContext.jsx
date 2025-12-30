import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";

const AudioPlayerContext = createContext();

export function AudioPlayerProvider({ children }) {
  const audioRef = useRef(new Audio());

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  /* ▶ Play a new track */
  const playTrack = (track) => {
    const audio = audioRef.current;

    if (audio.src !== track.audio_url) {
      audio.src = track.audio_url;
    }

    audio.play();
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  /* ⏯ Toggle play/pause */
  const togglePlay = () => {
    const audio = audioRef.current;

    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  /* 🎯 Seek function (THIS FIXES THE SLIDER) */
  const seek = (value) => {
    const audio = audioRef.current;
    audio.currentTime = value;
    setProgress(value);
  };

  /* Track progress */
  useEffect(() => {
    const audio = audioRef.current;

    const updateTime = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateTime);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateTime);
    };
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        playTrack,
        togglePlay,
        progress,
        duration,
        seek,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}
