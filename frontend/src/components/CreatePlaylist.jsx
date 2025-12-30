import { useState } from "react";

export default function CreatePlaylist({ userId, onCreated }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const createPlaylist = async () => {
    if (!name.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5001/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          user_id: userId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to create playlist");
        return;
      }

      onCreated(data);
      setName("");
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
      <input
        placeholder="New playlist name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ flex: 1, padding: "8px" }}
      />
      <button onClick={createPlaylist} disabled={loading}>
        {loading ? "Creating..." : "Create"}
      </button>
    </div>
  );
}
