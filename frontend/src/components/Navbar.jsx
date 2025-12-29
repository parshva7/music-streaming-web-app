import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
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
        <div>
          {user ? (
            <>
              <span style={{ marginRight: "12px" }}>
                {user.email}
              </span>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ marginRight: "12px" }}>
                Login
              </Link>
              <Link to="/signup">Signup</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
