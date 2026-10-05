import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import SearchBar from "./SearchBar.jsx";
import RandomButton from "./RandomButton.jsx";
import useWatchlist from "../hooks/useWatchlist.js";

const links = [
  { to: "/", label: "Home" },
  { to: "/browse", label: "Browse" },
  { to: "/schedule", label: "Schedule" },
  { to: "/season", label: "Seasons" },
  { to: "/watchlist", label: "Watchlist" },
  { to: "/history", label: "History" },
];

export default function Navbar() {
  const { list } = useWatchlist();
  const [theme, setTheme] = useState(
    () => localStorage.getItem("catch22:theme") || "catch22"
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("catch22:theme", theme);
  }, [theme]);

  return (
    <header className="sticky top-0 z-40 border-b-2 border-[var(--c22-edge)] bg-base-200/95 backdrop-blur">
      <div className="navbar mx-auto max-w-7xl gap-2 px-4">
        {/* Mobile / tablet menu */}
        <div className="dropdown lg:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-square" aria-label="Menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu dropdown-content z-50 mt-3 w-48 rounded-box bg-base-200 p-2 shadow">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to}>{l.label}</NavLink>
              </li>
            ))}
          </ul>
        </div>

        <Link to="/" className="c22-logo" aria-label="Catch22 home">
          Catch22<span className="c22-blink">_</span>
        </Link>

        {/* Desktop links */}
        <ul className="menu menu-horizontal hidden gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) => (isActive ? "menu-active" : "")}
              >
                {l.label}
                {l.to === "/watchlist" && list.length > 0 && (
                  <span className="badge badge-primary badge-sm">{list.length}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <SearchBar />
          <RandomButton className="btn btn-ghost btn-square" />
          <button
            className="btn btn-ghost btn-square"
            onClick={() => setTheme(theme === "catch22" ? "catch22-light" : "catch22")}
            aria-label="Toggle theme"
          >
            {theme === "catch22" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}
