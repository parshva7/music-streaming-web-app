import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";

export default function Dashboard() {
  const { user } = useAuth();

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div>
      <h1>Welcome</h1>
      <p>{user.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
