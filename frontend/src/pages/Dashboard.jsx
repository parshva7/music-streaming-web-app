import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import TrackCard from "../components/TrackCard";
import SearchBar from "../components/SearchBar";

export default function Dashboard() {
  const { user } = useAuth();

  const [tracks, setTracks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔍 Fetch songs from backend search API
  const fetchTracks = async (query) => {
    if (!query) {
      setTracks([]);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:5001/search?q=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setTracks(data);
    } catch (err) {
      console.error("Search failed", err);
      setTracks([]);
    } finally {
      setLoading(false);
    }
  };

  // ⏱ Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTracks(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div style={{ padding: "20px", paddingBottom: "100px" }}>
      {/* Header */}
      <h1>Welcome</h1>
      <p>{user.email}</p>

      {/* Music Section */}
      <h2>Music</h2>

      <SearchBar value={search} onChange={setSearch} />

      {loading && <p>Searching...</p>}

      {!loading && search && tracks.length === 0 && (
        <p>No songs found</p>
      )}

      <div
        style={{
          display: "grid",
          gap: "12px",
          marginTop: "16px",
        }}
      >
        {tracks.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
}
