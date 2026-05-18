import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useClerk,
} from "@clerk/clerk-react";

import useTheme from "../context/useTheme";

import PointsBadge from "./PointsBadge";

const TABS = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/challenge/bugfix", label: "Fix-Bugs" },
  { path: "/challenge/design", label: "System Design" },
  { path: "/daily", label: "Daily" },
  { path: "/history", label: "History" },
  { path: "/leaderboard", label: "Leaderboard" },
];

const clerkAppearance = {
  variables: {
    colorPrimary: "#ea752d",
    colorBackground: "#111118",
    colorInputBackground: "#0b0b12",
    colorInputText: "#ffffff",
    colorText: "#ffffff",
    colorTextSecondary: "#97979b",
    borderRadius: "14px",
  },

  elements: {
    card: {
      background: "#111118",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
    },

    headerTitle: {
      color: "#ea752d",
      fontSize: "38px",
      fontWeight: "800",
    },

    headerSubtitle: {
      color: "#97979b",
    },

    socialButtonsBlockButton: {
      background: "#0b0b12",
      border: "1px solid rgba(255,255,255,0.06)",
      color: "#ffffff",
    },

    socialButtonsBlockButtonText: {
      color: "#ffffff",
    },

    formFieldLabel: {
      color: "#ffffff",
    },

    formFieldInput: {
      background: "#0b0b12",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#ffffff",
    },

    formButtonPrimary: {
      background: "#ea752d",
      color: "#ffffff",
      border: "none",
    },

    footerActionLink: {
      color: "#ea752d",
    },

    identityPreviewText: {
      color: "#97979b",
    },

    formResendCodeLink: {
      color: "#ea752d",
    },

    footer: {
      display: "none",
    },

    badge: {
      display: "none",
    },
  },
};

export default function Navbar({ refreshTrigger }) {
  const { signOut } = useClerk();

  const location = useLocation();

  const navigate = useNavigate();

  const { theme, toggleTheme } = useTheme();

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
      {/* LOGO */}

      <Link
        to="/"
        style={{
          fontFamily: "'Syne', monospace",
          fontSize: "15px",
          fontWeight: 700,
          color: "var(--text)",
          flexShrink: 0,
          textDecoration: "none",
        }}
      >
        Rank<span style={{ color: "var(--primary)" }}>Byte</span>
      </Link>

      {/* NAVIGATION */}

      <SignedIn>
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
                textDecoration: "none",

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
      </SignedIn>

      {/* RIGHT SIDE */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        {/* THEME TOGGLE */}

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

        {/* SIGNED IN */}

        <SignedIn>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {/* PROFILE / POINTS */}

            <div
              onClick={() => navigate("/profile")}
              style={{
                cursor: "pointer",
              }}
            >
              <PointsBadge refreshTrigger={refreshTrigger} />
            </div>

            {/* LOGOUT */}

            <button
              onClick={() => signOut()}
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--muted)",
                padding: "7px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "12px",
                transition: "0.2s ease",
              }}
            >
              Logout
            </button>
          </div>
        </SignedIn>

        {/* SIGNED OUT */}

        <SignedOut>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            {/* SIGN IN */}

            <SignInButton mode="modal" appearance={clerkAppearance}>
              <button
                style={{
                  background: "transparent",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Sign In
              </button>
            </SignInButton>

            {/* SIGN UP */}

            <SignUpButton mode="modal" appearance={clerkAppearance}>
              <button
                style={{
                  background: "var(--primary)",
                  color: "white",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </SignedOut>
      </div>
    </nav>
  );
}
