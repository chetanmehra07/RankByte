import { useEffect, useState } from "react";

import { getDailyChallenge } from "../services/api";

import DailyBugFix from "./DailyBugFix";
import DailySystemDesign from "./DailySystemDesign";

const card = {
  background: "var(--card)",
  borderRadius: "18px",
};

export default function DailyChallenge() {
  const clerkId = "test_user_1";

  const [dailyChallenges, setDailyChallenges] = useState([]);

  const [loading, setLoading] = useState(true);

  const [timeLeft, setTimeLeft] = useState("");

  const [selectedChallenge, setSelectedChallenge] = useState(null);

  // ======================================================
  // LOAD DAILY CHALLENGES
  // ======================================================

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await getDailyChallenge(clerkId);

        setDailyChallenges(res.data.daily_challenges || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  // ======================================================
  // TIMER
  // ======================================================

  useEffect(() => {
    const tick = () => {
      const now = new Date();

      const midnight = new Date();

      midnight.setHours(24, 0, 0, 0);

      const diff = Math.max(0, Math.floor((midnight - now) / 1000));

      const h = Math.floor(diff / 3600);

      const m = Math.floor((diff % 3600) / 60);

      const s = diff % 60;

      setTimeLeft(
        `${String(h).padStart(2, "0")}h ${String(m).padStart(
          2,
          "0",
        )}m ${String(s).padStart(2, "0")}s`,
      );
    };

    tick();

    const id = setInterval(tick, 1000);

    return () => clearInterval(id);
  }, []);

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div
        style={{
          padding: "60px",
          textAlign: "center",
          color: "#6a6a8a",
        }}
      >
        Loading daily challenges...
      </div>
    );
  }

  // ======================================================
  // DAILY BUG FIX PAGE
  // ======================================================

  if (selectedChallenge && selectedChallenge.challenge_type === "BUG_FIX") {
    return (
      <DailyBugFix
        challenge={selectedChallenge}
        onBack={() => setSelectedChallenge(null)}
      />
    );
  }

  // ======================================================
  // DAILY SYSTEM DESIGN PAGE
  // ======================================================

  if (
    selectedChallenge &&
    selectedChallenge.challenge_type === "SYSTEM_DESIGN"
  ) {
    return (
      <DailySystemDesign
        challenge={selectedChallenge}
        onBack={() => setSelectedChallenge(null)}
      />
    );
  }

  // ======================================================
  // MAIN PAGE
  // ======================================================

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "28px",
        fontFamily: "'Syne', sans-serif",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "26px",
        }}
      >
        <div
          style={{
            fontSize: "30px",
            fontWeight: 700,
            marginBottom: "20px",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          Daily <span style={{ color: "var(--primary)" }}>Challenges</span>
        </div>

        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "10px 16px",
            fontSize: "12px",
            color: "var(--muted)",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          Resets in {timeLeft}
        </div>
      </div>

      {/* GRID */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(420px,1fr))",
          gap: "24px",
        }}
      >
        {dailyChallenges.map((challenge) => {
          const isSystem = challenge.challenge_type === "SYSTEM_DESIGN";

          return (
            <div
              key={challenge.daily_challenge_id}
              style={{
                ...card,
                padding: "26px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  width: "240px",
                  height: "240px",
                  borderRadius: "50%",
                  filter: "blur(90px)",
                  top: "-80px",
                  right: "-60px",
                }}
              />

              {/* TYPE */}

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 2px",
                  borderRadius: "999px",
                  background: isSystem
                    ? "var(--primary)15"
                    : "var(--primary)15",
                  border: isSystem
                    ? "1px solid var(--primary)40"
                    : "1px solid var(--primary)40",
                  color: isSystem ? "var(--primary)" : "var(--primary)",
                  fontSize: "11px",
                  fontFamily: "'Space Mono', monospace",
                  marginBottom: "18px",
                }}
              >
                {isSystem ? "SYSTEM DESIGN" : " BUG FIX"}
              </div>

              {/* TITLE */}

              <div
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  lineHeight: 1.05,
                  marginBottom: "14px",
                }}
              >
                {challenge.title?.replace("[DAILY] ", "")}
              </div>

              {/* DESC */}

              <div
                style={{
                  fontSize: "14px",
                  lineHeight: 1.8,
                  color: "#9ca3af",
                  marginBottom: "24px",
                }}
              >
                {challenge.description}
              </div>

              {/* FOOTER */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: isSystem ? "var(--primary)" : "var(--primary)",
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  +{challenge.bonus_points} XP
                </div>

                <button
                  onClick={() => setSelectedChallenge(challenge)}
                  style={{
                    padding: "12px 20px",
                    border: "none",
                    borderRadius: "12px",
                    background: "var(--primary)",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Solve Challenge →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
