import { useEffect, useState } from "react";

import { getUserStats } from "../services/api";

const LEVEL_COLORS = {
  Beginner: "var(--primary)",

  Developer: "var(--primary)",

  Pro: "var(--primary)",

  Expert: "var(--primary)",

  Master: "var(--primary)",
};

export default function PointsBadge({ refreshTrigger }) {
  const clerkId = "test_user_1";

  const [stats, setStats] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        const res = await getUserStats(clerkId);

        console.log("POINT BADGE:", res.data);

        if (mounted) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("PointsBadge error:", err);
      }
    };

    loadStats();

    return () => {
      mounted = false;
    };
  }, [refreshTrigger]);

  if (!stats) return null;

  const level = stats.difficulty_info?.level || "Developer";

  const color = LEVEL_COLORS[level] || "var(--primary)";

  return (
    <div
      style={{
        display: "flex",

        alignItems: "center",

        gap: "8px",

        background: "var(--card)",

        border: "1px solid var(--border)",

        borderRadius: "20px",

        padding: "5px 12px 5px 5px",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: "26px",

          height: "26px",

          borderRadius: "50%",

          background: `linear-gradient(
            135deg,
            ${color},
            var(--primary)
          )`,

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          fontSize: "11px",

          fontWeight: 700,

          color: "#fff",

          fontFamily: "'Space Mono', monospace",
        }}
      >
        C
      </div>

      {/* User Info */}
      <div>
        <div
          style={{
            fontSize: "12px",

            color: "var(--text)",

            fontWeight: 600,
          }}
        >
          Chetan
        </div>

        <div
          style={{
            fontSize: "10px",

            color,

            fontFamily: "'Space Mono', monospace",
          }}
        >
          {level} · {stats.total_points || 0} pts
        </div>
      </div>
    </div>
  );
}
