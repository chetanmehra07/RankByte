const LEVELS = [
  {
    name: "Beginner",
    min: 0,
    max: 100,
    color: "var(--primary)",
  },

  {
    name: "Developer",
    min: 101,
    max: 300,
    color: "var(--primary)",
  },

  {
    name: "Pro",
    min: 301,
    max: 700,
    color: "var(--primary)",
  },

  {
    name: "Expert",
    min: 701,
    max: 1500,
    color: "var(--primary)",
  },

  {
    name: "Master",
    min: 1501,
    max: Infinity,
    color: "var(--primary)",
  },
];

export default function LevelProgressBar({ totalPoints }) {
  const idx = LEVELS.findIndex((l) => totalPoints <= l.max);

  const current = LEVELS[idx] ?? LEVELS[4];

  const next = LEVELS[idx + 1] ?? null;

  const progress = next
    ? Math.min(
        100,
        ((totalPoints - current.min) / (next.min - current.min)) * 100,
      )
    : 100;

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "22px",
        transition: "0.25s ease",
      }}
    >
      {/* Top Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <span
          style={{
            fontSize: "18px",
            fontWeight: 700,
            color: "var(--text)",
            letterSpacing: "-0.3px",
          }}
        >
          {next ? `Progress to ${next.name}` : "🏆 Max Level Reached!"}
        </span>

        <span
          style={{
            fontSize: "13px",
            color: "var(--muted)",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {totalPoints} / {next ? next.min : "MAX"} pts
        </span>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          background: "var(--border)",
          borderRadius: "999px",
          height: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            borderRadius: "999px",
            background: current.color,
            transition: "width .6s ease",
          }}
        />
      </div>

      {/* Bottom Labels */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "12px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: current.color,
            fontFamily: "'Space Mono', monospace",
          }}
        >
          {current.name}
        </span>

        {next && (
          <span
            style={{
              fontSize: "12px",
              color: "var(--muted)",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            {next.min - totalPoints} pts to {next.name}
          </span>
        )}
      </div>
    </div>
  );
}
