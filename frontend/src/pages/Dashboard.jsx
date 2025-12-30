import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import TrackCard from "../components/TrackCard";
import SearchBar from "../components/SearchBar";
import CreatePlaylist from "../components/CreatePlaylist";

export default function Dashboard() {
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [playlistTracks, setPlaylistTracks] = useState([]);

  /* =========================
     Fetch user playlists
  ========================= */
  useEffect(() => {
    if (!user) return;

    fetch(`http://localhost:5001/playlists/${user.id}`)
      .then((res) => res.json())
      .then((data) => setPlaylists(Array.isArray(data) ? data : []))
      .catch(() => setPlaylists([]));
  }, [user]);

  /* =========================
     Search songs (iTunes)
  ========================= */
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!search) {
        setTracks([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5001/search?q=${encodeURIComponent(search)}`
        );
        const data = await res.json();
        setTracks(Array.isArray(data) ? data : []);
      } catch {
        setTracks([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  /* =========================
     Load playlist tracks
  ========================= */
  const loadPlaylistTracks = async (playlist) => {
    setSelectedPlaylist(playlist);

    try {
      const res = await fetch(
        `http://localhost:5001/playlists/${playlist.id}/tracks`
      );
      const data = await res.json();
      setPlaylistTracks(Array.isArray(data) ? data : []);
    } catch {
      setPlaylistTracks([]);
    }
  };

  if (!user) return null;

  return (
    <div style={{ padding: 20, paddingBottom: 120 }}>
      {/* Header */}
      <h1>Welcome</h1>
      <p>{user.email}</p>

      {/* Playlists */}
      <h2>Your Playlists</h2>

      <CreatePlaylist
        userId={user.id}
        onCreated={(pl) => setPlaylists((prev) => [pl, ...prev])}
      />

      {playlists.length === 0 && <p>No playlists yet</p>}

      <ul style={{ paddingLeft: 18 }}>
        {playlists.map((pl) => (
          <li
            key={pl.id}
            style={{
              cursor: "pointer",
              fontWeight:
                selectedPlaylist?.id === pl.id ? "bold" : "normal",
            }}
            onClick={() => loadPlaylistTracks(pl)}
          >
            {pl.name}
          </li>
        ))}
      </ul>

      {/* Playlist songs */}
      {selectedPlaylist && (
        <>
          <h3 style={{ marginTop: 16 }}>
            Playlist: {selectedPlaylist.name}
          </h3>

          {playlistTracks.length === 0 ? (
            <p>No songs in this playlist yet</p>
          ) : (
            playlistTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                isInPlaylist
                playlistId={selectedPlaylist.id}
                onDeleted={() => loadPlaylistTracks(selectedPlaylist)}
              />
            ))
          )}
        </>
      )}

      {/* Music Search */}
      <h2 style={{ marginTop: 28 }}>Music</h2>

      <SearchBar value={search} onChange={setSearch} />

      {loading && <p>Searching...</p>}
      {!loading && search && tracks.length === 0 && (
        <p>No songs found</p>
      )}

      {tracks.map((track) => (
        <TrackCard
          key={track.external_id || track.id}
          track={track}
          playlists={playlists}
        />
      ))}
    </div>
  );
}
