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

  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [currentTrack, setCurrentTrack] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  /* ⛔ STOP (logout / cleanup) */
  const stop = () => {
    const audio = audioRef.current;
    audio.pause();
    audio.src = "";
    audio.currentTime = 0;

    setIsPlaying(false);
    setCurrentTrack(null);
    setQueue([]);
    setCurrentIndex(-1);
    setProgress(0);
    setDuration(0);
  };

  /* 🔊 Core loader (SAFE, single play call) */
  const loadAndPlay = async (track, index) => {
    const audio = audioRef.current;

    try {
      audio.pause();
      audio.src = "";                 // 🔑 reset
      audio.currentTime = 0;

      audio.src = track.audio_url;
      audio.volume = volume;

      await audio.play();             // ✅ ONLY ONCE

      setCurrentTrack(track);
      setCurrentIndex(index);
      setIsPlaying(true);
    } catch (err) {
      console.warn("Playback failed:", err.message);
    }
  };

  /* ▶ Play queue */
  const playQueue = async (tracks, startIndex = 0) => {
    if (!tracks || tracks.length === 0) return;

    setQueue(tracks);
    await loadAndPlay(tracks[startIndex], startIndex);
  };

  /* ▶ Play single track (keeps queue if provided) */
  const playTrack = async (track, sourceQueue = null) => {
    if (sourceQueue && sourceQueue.length) {
      const index = sourceQueue.findIndex(
        (t) => t.audio_url === track.audio_url
      );

      setQueue(sourceQueue);
      await loadAndPlay(track, index === -1 ? 0 : index);
      return;
    }

    setQueue([track]);
    await loadAndPlay(track, 0);
  };

  /* ⏯ Play / Pause */
  const togglePlay = async () => {
    const audio = audioRef.current;

    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  /* ⏭ Next */
  const playNext = async () => {
    if (!queue.length) return;

    let nextIndex = shuffle
      ? Math.floor(Math.random() * queue.length)
      : currentIndex + 1;

    if (nextIndex >= queue.length) {
      if (!repeat) return;
      nextIndex = 0;
    }

    await loadAndPlay(queue[nextIndex], nextIndex);
  };

  /* ⏮ Previous */
  const playPrev = async () => {
    if (!queue.length) return;

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = repeat ? queue.length - 1 : 0;

    await loadAndPlay(queue[prevIndex], prevIndex);
  };

  /* 🎯 Seek */
  const seek = (value) => {
    audioRef.current.currentTime = value;
    setProgress(value);
  };

  /* 🔊 Volume */
  const changeVolume = (value) => {
    audioRef.current.volume = value;
    setVolume(value);
  };

  /* ⏱ Progress + auto-next */
  useEffect(() => {
    const audio = audioRef.current;

    const updateTime = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateTime);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [queue, currentIndex, repeat, shuffle]);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        duration,
        volume,
        shuffle,
        repeat,
        playTrack,
        playQueue,
        togglePlay,
        playNext,
        playPrev,
        seek,
        changeVolume,
        setShuffle,
        setRepeat,
        stop,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  return useContext(AudioPlayerContext);
}
