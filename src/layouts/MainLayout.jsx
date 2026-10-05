import { Outlet, ScrollRestoration } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Ticker from "../components/Ticker.jsx";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Ticker />
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
