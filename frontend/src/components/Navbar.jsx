import { Link, useLocation } from "react-router-dom";
import useTheme from "../context/useTheme";
import PointsBadge from "./PointsBadge";

const TABS = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/challenge/bugfix", label: " Fix-Bugs" },
  { path: "/challenge/design", label: " System Design" },
  { path: "/daily", label: " Daily" },
  { path: "/history", label: " History" },
  { path: "/leaderboard", label: " Leaderboard" },
];

export default function Navbar({ refreshPoints }) {
  const location = useLocation();

  const { theme, toggleTheme } = useTheme();

  // temporary dummy login
  const isSignedIn = true;

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 24px",
        borderBottom: "1px solid var(--border)",
        background: "var(--card)",
        position: "sticky",
        top: 0,
        zIndex: 100,
        fontFamily: "'Syne', sans-serif",
        gap: "10px",
        height: "58px",
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          fontFamily: "'syne', monospace",
          fontSize: "15px",
          fontWeight: 700,
          color: "var(--text)",
          flexShrink: 0,
        }}
      >
        Rank<span style={{ color: "var(--primary)" }}>Byte</span>
      </Link>

      {/* Navigation Tabs */}
      {isSignedIn && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            overflowX: "auto",
          }}
        >
          {TABS.map((t) => (
            <Link
              key={t.path}
              to={t.path}
              style={{
                padding: "5px 10px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 700,
                whiteSpace: "nowrap",

                color:
                  location.pathname === t.path
                    ? "var(--primary)"
                    : "var(--muted)",

                background:
                  location.pathname === t.path ? "var(--bg)" : "transparent",

                transition: "0.2s ease",
              }}
            >
              {t.label}
            </Link>
          ))}
        </div>
      )}

      {/* Right Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          style={{
            background: "var(--bg)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            padding: "5px 10px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "12px",
            transition: "0.2s ease",
          }}
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>

        {/* Points */}
        <PointsBadge refreshTrigger={refreshPoints} />
      </div>
    </nav>
  );
}
