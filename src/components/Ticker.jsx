const MESSAGES = [
  "Welcome to Catch22",
  "New: continue watching",
  "Airing schedule updated daily",
  "Your watchlist saves in this browser",
  "Press the dice for a random anime",
];

// Scrolling marquee. The list is rendered twice so the loop is seamless.
export default function Ticker() {
  const group = MESSAGES.map((m) => <span key={m}>★ {m}</span>);
  return (
    <div className="c22-ticker" role="presentation">
      <div className="c22-ticker-track">
        <div>{group}</div>
        <div aria-hidden="true">{group}</div>
      </div>
    </div>
  );
}
