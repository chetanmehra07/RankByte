import { useEffect, useState } from "react";
import { getLeaderboard } from "../services/api";

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);
  const [userRank, setUserRank] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const r = await getLeaderboard(currentPage, 10);

        setLeaders(r.data.users || []);

        setTotalPages(r.data.total_pages || 1);

        setCurrentUser(r.data.current_user);

        setUserRank(r.data.current_user?.rank);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLeaderboard();

    const handleRefresh = async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));

      await fetchLeaderboard();
    };

    window.addEventListener("leaderboard-refresh", handleRefresh);

    return () => {
      window.removeEventListener("leaderboard-refresh", handleRefresh);
    };
  }, [currentPage]);

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

      {leaders.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "var(--primary)",
          }}
        >
          Loading leaderboard...
        </div>
      ) : (
        <>
          {/* TOP 3 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: currentUser
                ? "88px 1.2fr 140px 120px 100px"
                : "1fr",
              fontFamily: "'Space Mono', monospace",
              alignItems: "center",
              background: "var(--card)",
              borderRadius: "18px",
              padding: "18px 28px",
              marginBottom: "26px",
              boxShadow: "0 0 1.2px var(--muted)",
              letterSpacing: "1px",
            }}
          >
            {/* RANK */}
            {currentUser && (
              <div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "var(--muted)",
                    marginBottom: "4px",
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  RANK
                </div>

                <div
                  style={{
                    color: "var(--primary)",
                    fontWeight: 600,
                    fontSize: "18px",
                  }}
                >
                  #{userRank}
                </div>
              </div>
            )}

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
                  fontFamily: "'Syne', sans-serif",
                  flexShrink: 0,
                }}
              >
                {(currentUser?.username || "Guest").charAt(0).toUpperCase()}
              </div>

              <div>
                <div
                  style={{
                    fontWeight: 700,
                    marginBottom: "4px",
                    fontSize: "15px",
                    color: "var(--primary)",
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  {formatUsername(currentUser?.username || "Guest Challenger")}
                </div>

                <div
                  style={{
                    fontSize: "10px",
                    color: "var(--muted)",
                    letterSpacing: "0.5px",
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {currentUser
                    ? "RankByte Challenger"
                    : "Sign in to track your rank"}
                </div>
              </div>
            </div>

            {/* POINTS */}
            {currentUser && (
              <div>
                <div
                  style={{
                    color: "var(--primary)",
                    fontWeight: 600,
                    fontSize: "15px",
                    marginLeft: "4px",
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {currentUser?.total_points} XP
                </div>
              </div>
            )}

            {/* LEVEL */}
            {currentUser && (
              <div>
                <div
                  style={{
                    color: "var(--primary)",
                    fontWeight: 600,
                    fontSize: "15px",
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {currentUser?.level}
                </div>
              </div>
            )}

            {/* STREAK */}
            {currentUser && (
              <div>
                <div
                  style={{
                    color: "var(--primary)",
                    fontWeight: 600,
                    marginLeft: "30px",
                    fontSize: "15px",
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {currentUser?.streak_days}
                </div>
              </div>
            )}
          </div>
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
                gridTemplateColumns: "90px 1.2fr 140px 120px 100px",
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
                  boxShadow: "0 0 2px var(--primary)",
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
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "16px",
                marginTop: "25px",
                marginBottom: "20px",
              }}
            >
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "12px 26px",
                  borderRadius: "10px",
                  border: "none",
                  background: "var(--card)",
                  color: "var(--primary)",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  fontSize: "15px",
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                Prev
              </button>

              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--muted)",
                  minWidth: "20px",
                  textAlign: "center",
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                {currentPage}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                style={{
                  padding: "12px 26px",
                  borderRadius: "10px",
                  border: "none",
                  background: "var(--card)",
                  color: "var(--primary)",
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  fontSize: "15px",
                  fontFamily: "'Syne', sans-serif",
                  opacity: currentPage === totalPages ? 0.5 : 1,
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
