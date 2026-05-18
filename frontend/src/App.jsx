import { Routes, Route, Navigate } from "react-router-dom";

import { useState, useEffect } from "react";

import { useAuth } from "@clerk/clerk-react";

import { setAuthToken } from "./services/api";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import BugFixer from "./pages/BugFixer";
import SystemDesign from "./pages/SystemDesign";
import LeaderboardPage from "./pages/Leaderboard";
import HistoryPage from "./pages/History";
import DailyChallenge from "./pages/DailyChallenge";
import Profile from "./pages/Profile";

export default function App() {
  // =========================
  // CLERK AUTH
  // =========================

  const { getToken } = useAuth();

  // =========================
  // SET TOKEN GLOBALLY
  // =========================

  useEffect(() => {
    const loadToken = async () => {
      try {
        setAuthToken(async () => {
          return await getToken({
            template: "backend",
          });
        });
      } catch (error) {
        console.error("Failed to set auth token:", error);
      }
    };

    loadToken();
  }, [getToken]);

  // =========================
  // GLOBAL REFRESH STATE
  // =========================

  const [refreshPoints, setRefreshPoints] = useState(0);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        transition: "all 0.25s ease",
      }}
    >
      {/* NAVBAR */}

      <Navbar refreshTrigger={refreshPoints} />

      <Routes>
        {/* HOME */}

        <Route path="/" element={<Home />} />

        {/* DASHBOARD */}

        <Route path="/dashboard" element={<Dashboard />} />

        {/* BUG FIX */}

        <Route
          path="/challenge/bugfix"
          element={<BugFixer setRefreshPoints={setRefreshPoints} />}
        />

        {/* SYSTEM DESIGN */}

        <Route
          path="/challenge/design"
          element={<SystemDesign setRefreshPoints={setRefreshPoints} />}
        />

        {/* DAILY */}

        <Route
          path="/daily"
          element={<DailyChallenge setRefreshPoints={setRefreshPoints} />}
        />

        {/* HISTORY */}

        <Route path="/history" element={<HistoryPage />} />

        {/* LEADERBOARD */}

        <Route path="/leaderboard" element={<LeaderboardPage />} />

        {/* PROFILE */}

        <Route path="/profile" element={<Profile />} />

        {/* FALLBACK */}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}
