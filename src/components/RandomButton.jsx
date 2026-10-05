import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRandomAnime } from "../api/anime";

// Picks a random anime from Jikan and opens its detail page.
export default function RandomButton({ className = "btn btn-ghost btn-sm", children }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const go = async () => {
    setLoading(true);
    try {
      const res = await getRandomAnime();
      navigate(`/anime/${res.data.mal_id}`);
    } catch {
      alert("Could not pick a random anime right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className={className} onClick={go} disabled={loading} title="Random anime">
      {loading ? <span className="loading loading-spinner loading-xs" /> : "🎲"}
      {children}
    </button>
  );
}
