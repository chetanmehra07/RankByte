import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useState } from "react";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import BugFixer from "./pages/BugFixer";
import SystemDesign from "./pages/SystemDesign";
import LeaderboardPage from "./pages/Leaderboard";
import HistoryPage from "./pages/History";
import DailyChallenge from "./pages/DailyChallenge";

export default function App() {
  // GLOBAL refresh state
  const [refreshPoints, setRefreshPoints] = useState(0);

  return (
    <BrowserRouter>
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          color: "var(--text)",
          transition: "all 0.25s ease",
        }}
      >
        {/* Pass refresh trigger to navbar */}
        <Navbar refreshPoints={refreshPoints} />

        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/dashboard" element={<Dashboard />} />

          {/* Pass setter to BugFixer */}
          <Route
            path="/challenge/bugfix"
            element={<BugFixer setRefreshPoints={setRefreshPoints} />}
          />

          {/* Pass setter to SystemDesign */}
          <Route
            path="/challenge/design"
            element={<SystemDesign setRefreshPoints={setRefreshPoints} />}
          />

          <Route path="/daily" element={<DailyChallenge />} />

          <Route path="/history" element={<HistoryPage />} />

          <Route path="/leaderboard" element={<LeaderboardPage />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
