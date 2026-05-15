import { useEffect, useState } from "react";
import { getHistory, getLanguageMastery } from "../services/api";

const LEVEL_COLORS = {
  Beginner: "var(--secondary)",
  Intermediate: "var(--secondary)",
  Advanced: "var(--secondary)",
  Expert: "var(--secondary)",
};

const LEVEL_MAX = {
  Beginner: 50,
  Intermediate: 150,
  Advanced: 400,
  Expert: 9999,
};

const formatTime = (s) => {
  if (!s) return "—";

  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
};

const card = {
  background: "var(--card)",
  border: "1px solid rgba(124,109,240,0.15)",
  borderRadius: "18px",
  backdropFilter: "blur(12px)",
  boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
};

export default function HistoryPage() {
  // TEMP USER
  const user = { id: "test_user_1" };

  const [history, setHistory] = useState([]);
  const [mastery, setMastery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [tab, setTab] = useState("history");

  useEffect(() => {
    Promise.all([getHistory(user.id), getLanguageMastery(user.id)])
      .then(([h, m]) => {
        setHistory(h.data || []);
        setMastery(m.data || []);
      })
      .catch((err) => {
        console.error("History page error:", err);
      })
      .finally(() => setLoading(false));
  }, [user.id]);

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "30px",
        fontFamily: "'Syne', sans-serif",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          marginBottom: "28px",
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
          Challenge <span style={{ color: "var(--primary)" }}>History</span>
        </div>

        <div
          style={{
            color: "#8b8ba7",
            fontSize: "14px",
          }}
        >
          Track your coding progress and AI evaluations
        </div>
      </div>

      {/* TABS */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "24px",
        }}
      >
        {[
          { key: "history", label: "Submissions" },
          { key: "mastery", label: "Language Mastery" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              border:
                tab === t.key
                  ? "1px solid var(--primary)"
                  : "1px solid var(--border)",
              background: tab === t.key ? "var(--primary)" : "var(--card)",
              color: tab === t.key ? "var(--card)" : "var(--text)",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "13px",
              transition: "all .2s ease",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading ? (
        <div
          style={{
            padding: "50px",
            textAlign: "center",
            color: "#8b8ba7",
          }}
        >
          Loading...
        </div>
      ) : tab === "history" ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {history.length === 0 && (
            <div
              style={{
                ...card,
                padding: "40px",
                textAlign: "center",
                color: "#8b8ba7",
              }}
            >
              No submissions yet.
            </div>
          )}

          {history.map((s, i) => (
            <div
              key={i}
              style={{
                ...card,
                overflow: "hidden",
              }}
            >
              <div
                onClick={() => setExpanded(expanded === i ? null : i)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr 110px 90px 90px 50px",
                  alignItems: "center",
                  padding: "22px",
                  gap: "16px",
                  cursor: "pointer",
                }}
              >
                {/* TYPE */}
                <div>
                  <div
                    style={{
                      padding: "8px 14px",

                      background: "var(--card)",

                      color: "var(--primary)",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: ".7px",
                      textTransform: "uppercase",
                    }}
                  >
                    {s.challenge_type?.replaceAll("_", " ")}
                  </div>
                </div>

                {/* TITLE */}
                <div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "var(--text)",
                      marginBottom: "6px",
                    }}
                  >
                    {s.challenge_title || "Untitled Challenge"}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      color: "var(--muted)",
                      fontSize: "12px",
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    <span>{s.language || "Unknown"}</span>

                    <span>•</span>

                    <span>
                      {s.submitted_at
                        ? new Date(s.submitted_at).toLocaleDateString("en-IN")
                        : "No Date"}
                    </span>
                  </div>
                </div>

                {/* DIFFICULTY */}
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: "10px",
                    textAlign: "center",
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    color: "var(--primary)",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  {s.difficulty || "Unknown"}
                </div>

                {/* SCORE */}
                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "34px",
                      fontWeight: 800,
                      lineHeight: 1,
                      fontFamily: "'Space Mono', monospace",
                      color:
                        s.score >= 80
                          ? "#16dfadcf"
                          : s.score >= 50
                            ? "#f6ae28d8"
                            : "#f34d66",
                    }}
                  >
                    {s.score ?? 0}
                  </div>

                  <div
                    style={{
                      fontSize: "10px",
                      color: "#6a6a8a",
                      marginTop: "4px",
                      letterSpacing: "1px",
                    }}
                  >
                    SCORE
                  </div>
                </div>

                {/* TIME */}
                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#d8d8ef",
                      fontFamily: "'Space Mono', monospace",
                      fontWeight: 600,
                    }}
                  >
                    {formatTime(s.time_taken_seconds)}
                  </div>

                  <div
                    style={{
                      fontSize: "10px",
                      color: "#6a6a8a",
                      marginTop: "4px",
                      letterSpacing: "1px",
                    }}
                  >
                    TIME
                  </div>
                </div>

                {/* STATUS */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      background: s.is_correct ? "#0edeaa" : "#ff6b81",
                      boxShadow: s.is_correct
                        ? "0 0 12px rgba(103,232,200,.6)"
                        : "0 0 12px rgba(255,107,129,.6)",
                    }}
                  />
                </div>
              </div>

              {/* FEEDBACK */}
              {expanded === i && s.ai_feedback && (
                <div
                  style={{
                    borderTop: "1px solid rgba(124,109,240,.12)",
                    padding: "22px",
                    background: "var(--card)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      color: "var(--muted)",
                      lineHeight: 1.8,
                    }}
                  >
                    {s.ai_feedback.feedback}
                  </div>

                  {s.ai_feedback.improvements &&
                    s.ai_feedback.improvements.length > 0 && (
                      <div
                        style={{
                          marginTop: "18px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--primary)",
                            marginBottom: "10px",
                            fontWeight: 700,
                            letterSpacing: ".5px",
                          }}
                        >
                          IMPROVEMENTS
                        </div>

                        {s.ai_feedback.improvements.map((imp, idx) => (
                          <div
                            key={idx}
                            style={{
                              fontSize: "12px",
                              color: "var(--muted)",
                              marginBottom: "6px",
                            }}
                          >
                            • {imp}
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          {mastery.map((m, i) => {
            const levelColor = LEVEL_COLORS[m.level] || "#b8abff";

            const maxPts = LEVEL_MAX[m.level] || 50;

            const progress = Math.min(100, (m.points / maxPts) * 100);

            return (
              <div
                key={i}
                style={{
                  ...card,
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "var(--primary)",
                    marginBottom: "4px",
                  }}
                >
                  {m.language}
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: levelColor,
                    marginBottom: "18px",
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {m.level}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                    fontSize: "12px",
                  }}
                >
                  <span
                    style={{
                      color: "#8b8ba7",
                    }}
                  >
                    Progress
                  </span>

                  <span
                    style={{
                      color: "var(--primary)",
                      fontWeight: 700,
                    }}
                  >
                    {m.points} pts
                  </span>
                </div>

                <div
                  style={{
                    height: "8px",
                    background: "rgba(255,255,255,.05)",
                    borderRadius: "999px",
                    overflow: "hidden",
                    marginBottom: "14px",
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: "100%",
                      background: "var(--primary)",
                      borderRadius: "999px",
                      transition: "width .5s",
                    }}
                  />
                </div>

                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--muted)",
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {m.challenges_solved} solved
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
