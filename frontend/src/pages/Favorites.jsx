import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAudioPlayer } from "../context/AudioPlayerContext";
import TrackCard from "../components/TrackCard";

export default function Favorites() {
  const { user } = useAuth();
  const { playQueue } = useAudioPlayer();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      const res = await fetch(
        `http://localhost:5001/favorites/${user.id}`
      );
      const data = await res.json();
      setFavorites(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load favorites", err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) loadFavorites();
  }, [user]);

  if (!user) return null;

  return (
    <div style={{ padding: 20, paddingBottom: 120 }}>
      <h2>❤️ Your Favorites</h2>

      {loading && <p>Loading favorites...</p>}

      {!loading && favorites.length === 0 && (
        <p>No liked songs yet</p>
      )}

      <div style={{ display: "grid", gap: "12px" }}>
        {favorites.map((track, index) => (
          <TrackCard
            key={track.external_id || track.id}
            track={track}
            tracks={favorites}     // ✅ PASS FULL LIST
            index={index}          // ✅ PASS INDEX
            isFavorite
            onFavoriteChange={loadFavorites}
          />
        ))}
      </div>
    </div>
  );
}
