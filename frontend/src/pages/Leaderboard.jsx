import { useEffect, useState } from "react";
import { getLeaderboard } from "../services/api";

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = () => {
      getLeaderboard()
        .then((r) => setLeaders(r.data || []))
        .finally(() => setLoading(false));
    };

    // Initial fetch
    fetchLeaderboard();

    // Auto refresh every 3 sec
    const interval = setInterval(fetchLeaderboard, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatUsername = (username, index) => {
    if (!username) return `Developer ${index + 1}`;

    if (username.startsWith("test_user_")) {
      return `Developer ${username.split("_").pop()}`;
    }

    return username.replace(/_/g, " ");
  };

  return (
    <div
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "30px 20px 60px",
        fontFamily: "'Syne', sans-serif",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: "26px" }}>
        <div
          style={{
            fontSize: "30px",
            fontWeight: 700,
            marginBottom: "20px",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          Global <span style={{ color: "var(--primary)" }}>Leaderboard</span>
        </div>

        <div
          style={{
            color: "var(--muted)",
            fontSize: "15px",
          }}
        >
          Compete with developers and climb the ranks.
        </div>
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            color: "var(--primary)",
          }}
        >
          Loading leaderboard...
        </div>
      ) : (
        <>
          {/* TOP 3 */}

          {/* TABLE */}
          <div
            style={{
              background: "var(--card)",
              borderRadius: "15px",
              overflow: "hidden",
            }}
          >
            {/* HEADER */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 140px 120px 100px",
                padding: "16px 24px",
                fontSize: "13px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "var(--muted)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              <div>Rank</div>
              <div>Developer</div>
              <div>Points</div>
              <div>Level</div>
              <div>Streak</div>
            </div>

            {/* ROWS */}
            {leaders.map((leader, i) => {
              const isTop1 = i === 0;
              const isTop2 = i === 1;
              const isTop3 = i === 2;

              let specialStyle = {};

              if (isTop1 || isTop2 || isTop3) {
                specialStyle = {
                  background: "var(--card)",
                  boxShadow: "0 0 3px var(--primary)",
                };
              }

              return (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr 140px 120px 100px",
                    alignItems: "center",
                    padding: "18px 24px",
                    borderBottom:
                      i !== leaders.length - 1
                        ? "1px solid rgba(255,255,255,0.04)"
                        : "none",
                    transition: "0.25s",
                    borderRadius: "15px",
                    margin: "0 10px 10px 10px",
                    background: "var(--card)",
                    boxShadow: "0 0 3px var(--muted)",

                    ...specialStyle,
                  }}
                >
                  {/* RANK */}
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: "18px",
                      marginLeft: "15px",
                      color: isTop1
                        ? "var(--primary)"
                        : isTop2
                          ? "var(--primary)"
                          : isTop3
                            ? "var(--primary)"
                            : "var(--muted)",
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {leader.rank}
                  </div>

                  {/* USER */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "14px",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "54px",
                        background: "var(--primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        color: "#fff",
                        fontSize: "15px",
                        flexShrink: 0,
                      }}
                    >
                      {formatUsername(leader.username, i)
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          marginBottom: "4px",

                          fontSize: "15px",
                          color: "var(--primary)",
                        }}
                      >
                        {formatUsername(leader.username, i)}
                      </div>

                      <div
                        style={{
                          fontSize: "11px",
                          color: "var(--muted)",
                        }}
                      >
                        RankByte Challenger
                      </div>
                    </div>
                  </div>

                  {/* POINTS */}
                  <div
                    style={{
                      color: isTop1
                        ? "var(--primary)"
                        : isTop2
                          ? "var(--primary)"
                          : isTop3
                            ? "var(--primary)"
                            : "var(--primary)",
                      fontWeight: 600,
                      fontSize: "15px",
                      marginLeft: "8px",
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {leader.total_points} XP
                  </div>

                  {/* LEVEL */}
                  <div
                    style={{
                      color: "var(--muted)",
                      fontSize: "13px",
                      fontWeight: 500,
                      marginLeft: "10px",
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {leader.level}
                  </div>

                  {/* STREAK */}
                  <div
                    style={{
                      color: "var(--muted)",
                      fontSize: "13px",
                      fontWeight: 500,
                      marginLeft: "32px",
                      fontFamily: "'Space Mono', monospace",
                    }}
                  >
                    {leader.streak_days}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
