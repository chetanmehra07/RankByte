import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getUserStats, getPointsHistory } from "../services/api";

import LevelProgressBar from "../components/LevelProgressBar";

const ACTIONS = [
  {
    title: "Bug Fixer",
    desc: "Find and fix intentional bugs",

    link: "/challenge/bugfix",
    color: "var(--primary)",
  },

  {
    title: "System Design",
    desc: "Design a system architecture",

    link: "/challenge/design",
    color: "var(--primary)",
  },

  {
    title: "Daily Challenge",
    desc: "+50 pts bonus, resets midnight",

    link: "/daily",
    color: "var(--primary)",
  },
];

export default function Dashboard() {
  // temporary dummy auth

  const [stats, setStats] = useState(null);

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [s, h] = await Promise.all([getUserStats(), getPointsHistory()]);

        setStats(s.data);

        setHistory(h.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div
        style={{
          padding: "60px",
          textAlign: "center",
          color: "#6a6a8a",
        }}
      >
        Loading dashboard...
      </div>
    );
  }

  const s = stats || {};

  return (
    <div
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        padding: "28px",
        fontFamily: "'Syne', sans-serif",
      }}
    >
      {/* Heading */}
      <div
        style={{
          fontSize: "30px",
          fontWeight: 700,
          marginBottom: "20px",
          fontFamily: "'Syne', sans-serif",
        }}
      >
        Your <span style={{ color: "var(--primary)" }}>Dashboard</span>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        {[
          {
            label: "Total Points",
            value: s.total_points || 0,
            color: "var(--primary)",
            large: true,
          },

          {
            label: "Solved",
            value: s.total_solved || 0,
            color: "var(--primary)",
            large: true,
          },

          {
            label: "Streak",
            value: `${s.streak_days || 0} `,
            color: "var(--primary)",
            large: true,
          },

          {
            label: "Difficulty",
            value: s.difficulty_info?.difficulty || "Easy",

            color: "var(--primary)",

            large: false,
          },
        ].map((c, i) => (
          <div
            key={i}
            style={{
              background: "var(--card)",

              borderRadius: "12px",

              padding: "16px",
            }}
          >
            <div
              style={{
                fontSize: "11px",

                color: "#6a6a8a",

                fontFamily: "'Space Mono', monospace",

                textTransform: "uppercase",

                letterSpacing: ".5px",

                marginBottom: "8px",
              }}
            >
              {c.label}
            </div>

            <div
              style={{
                fontSize: c.large ? "28px" : "18px",

                fontWeight: 800,

                fontFamily: "'Space Mono', monospace",

                color: c.color,
              }}
            >
              {c.value}
            </div>
          </div>
        ))}
      </div>

      {/* Level Progress */}
      <div style={{ marginBottom: "20px" }}>
        <LevelProgressBar totalPoints={s.total_points || 0} />
      </div>

      {/* Quick Actions */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {ACTIONS.map((a, i) => (
          <Link key={i} to={a.link} style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "var(--card)",

                border: "1px solid var(--border)",

                borderRadius: "12px",

                padding: "18px",

                cursor: "pointer",

                transition: ".2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.borderColor = a.color)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.borderColor = "var(--border)")
              }
            >
              <div
                style={{
                  fontSize: "22px",
                  marginBottom: "8px",
                }}
              >
                {a.icon}
              </div>

              <div
                style={{
                  fontSize: "14px",

                  fontWeight: 700,

                  color: "var(--text)",

                  marginBottom: "4px",
                }}
              >
                {a.title}
              </div>

              <div
                style={{
                  fontSize: "11px",

                  color: "#6a6a8a",

                  lineHeight: 1.5,
                }}
              >
                {a.desc}
              </div>

              <div
                style={{
                  marginTop: "10px",

                  fontSize: "10px",

                  fontFamily: "'Space Mono', monospace",

                  padding: "3px 8px",

                  borderRadius: "4px",

                  background: `${a.color}20`,

                  color: a.color,

                  border: `1px solid ${a.color}40`,

                  display: "inline-block",
                }}
              >
                {s.difficulty_info?.difficulty || "Easy"} difficulty
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
        }}
      >
        {/* Breakdown */}
        <div
          style={{
            background: "var(--card)",

            border: "1px solid var(--border)",

            borderRadius: "12px",

            padding: "20px",
          }}
        >
          <div
            style={{
              fontSize: "11px",

              fontFamily: "'Space Mono', monospace",

              textTransform: "uppercase",

              letterSpacing: ".5px",
              fontWeight: 500,

              color: "var(--muted)",

              marginBottom: "14px",
            }}
          >
            Challenge Breakdown
          </div>

          {[
            {
              label: "Bug Fixes",
              value: s.bug_fixes_solved || 0,
              color: "var(--primary)",
            },

            {
              label: "System Designs",
              value: s.system_designs_solved || 0,
              color: "var(--primary)",
            },
          ].map((item, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div
                style={{
                  display: "flex",

                  justifyContent: "space-between",

                  marginBottom: "5px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--muted)",
                  }}
                >
                  {item.label}
                </span>

                <span
                  style={{
                    fontSize: "12px",

                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {item.value}
                </span>
              </div>

              <div
                style={{
                  background: "var(--border)",

                  borderRadius: "99px",

                  height: "5px",

                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      (item.value / (s.total_solved || 1)) * 100,
                    )}%`,

                    height: "100%",

                    background: item.color,

                    borderRadius: "99px",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div
          style={{
            background: "var(--card)",

            border: "1px solid var(--border)",

            borderRadius: "12px",

            padding: "20px",
          }}
        >
          <div
            style={{
              fontSize: "11px",

              fontFamily: "'Space Mono', monospace",

              textTransform: "uppercase",

              letterSpacing: ".5px",

              color: "var(--muted)",

              marginBottom: "14px",
            }}
          >
            Recent Activity
          </div>

          {history.length === 0 ? (
            <div
              style={{
                fontSize: "13px",
                color: "var(--muted)",
              }}
            >
              No activity yet. Solve your first challenge!
            </div>
          ) : (
            history.slice(0, 6).map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",

                  justifyContent: "space-between",

                  alignItems: "center",

                  marginBottom: "10px",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",

                    color: "var(--muted)",

                    overflow: "hidden",

                    textOverflow: "ellipsis",

                    whiteSpace: "nowrap",

                    maxWidth: "200px",
                  }}
                >
                  {h.reason}
                </span>

                <span
                  style={{
                    fontSize: "11px",

                    fontFamily: "'Space Mono', monospace",

                    color:
                      h.points_earned > 0 ? "var(--primary)" : "var(--primary)",

                    flexShrink: 0,
                  }}
                >
                  {h.points_earned > 0 ? "+" : ""}
                  {h.points_earned}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
