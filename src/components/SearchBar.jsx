import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const [text, setText] = useState("");
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const q = text.trim();
    if (!q) return;
    navigate(`/browse?q=${encodeURIComponent(q)}`);
    setText("");
  };

  return (
    <form onSubmit={submit} className="join">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="input input-bordered input-sm join-item w-32 sm:w-56"
        placeholder="Search anime..."
        aria-label="Search anime"
      />
      <button className="btn btn-primary btn-sm join-item" type="submit">
        Go
      </button>
    </form>
  );
}
