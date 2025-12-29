export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      placeholder="Search songs or artists..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "16px",
        borderRadius: "6px",
        border: "1px solid #ccc",
      }}
    />
  );
}
