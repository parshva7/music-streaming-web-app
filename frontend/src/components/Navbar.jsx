import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useAudioPlayer } from "../context/AudioPlayerContext"; // ✅ REQUIRED

export default function Navbar() {
  const { user, loading } = useAuth();
  const { stop } = useAudioPlayer(); // ✅ REQUIRED
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup";

  const handleLogout = async () => {
    stop(); // ✅ stops music + podcasts immediately
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px",
        borderBottom: "1px solid #ddd",
      }}
    >
      {/* Left */}
      <h3 style={{ margin: 0 }}>🎵 MusicStream</h3>

      {/* Right */}
      {!loading && (
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {/* Logged OUT */}
          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Signup</Link>
            </>
          )}

          {/* Logged IN */}
          {user && !isAuthPage && (
            <>
              <span>{user.email}</span>

              <Link to="/dashboard">Dashboard</Link>
              <Link to="/favorites">❤️ Favorites</Link>
              <Link to="/podcasts">🎧 Podcasts</Link>

              <button onClick={handleLogout}>Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
