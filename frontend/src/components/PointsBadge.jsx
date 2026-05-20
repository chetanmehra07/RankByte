import { useEffect, useState } from "react";

import { useUser } from "@clerk/clerk-react";

import { getUserStats } from "../services/api";

const LEVEL_COLORS = {
  Beginner: "var(--primary)",
  Developer: "var(--primary)",
  Pro: "var(--primary)",
  Expert: "var(--primary)",
  Master: "var(--primary)",
};

export default function PointsBadge({ refreshTrigger }) {
  const { user, isLoaded } = useUser();

  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    let mounted = true;

    const loadStats = async () => {
      try {
        const res = await getUserStats();

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
  }, [refreshTrigger, user, isLoaded]);

  // Don't render anything until Clerk fully loads
  if (!isLoaded || !user) return null;

  const level = stats?.level || stats?.difficulty_info?.level || "Beginner";

  const color = LEVEL_COLORS[level] || "var(--primary)";

  const totalPoints = stats?.total_points ?? null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "999px",
        padding: "6px 12px 6px 6px",
        cursor: "pointer",
        transition: "0.2s ease",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          overflow: "hidden",
          background: `linear-gradient(
            135deg,
            ${color},
            var(--primary)
          )`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "14px",
          fontWeight: 700,
          color: "#fff",
          fontFamily: "'Space Mono', monospace",
          flexShrink: 0,
        }}
      >
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt="profile"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          (user.fullName || user.firstName || "U").charAt(0).toUpperCase()
        )}
      </div>

      {/* User Info */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          lineHeight: 1.1,
        }}
      >
        <div
          style={{
            fontSize: "13px",
            color: "var(--text)",
            fontWeight: 700,
            maxWidth: "120px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {user.fullName ||
            user.username ||
            user.primaryEmailAddress?.emailAddress}
        </div>

        {/* Points */}
        {totalPoints !== null && (
          <div
            style={{
              fontSize: "11px",
              color,
              fontWeight: 600,
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {level} · {totalPoints} pts
          </div>
        )}
      </div>
    </div>
  );
}
