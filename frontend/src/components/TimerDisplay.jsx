import { useEffect, useState } from "react";

export default function TimerDisplay({ startTime, stopped = false }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime || stopped) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, stopped]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  const getInfo = () => {
    if (elapsed <= 300)
      return {
        color: "var(--primary)",
        bonus: "+10 speed bonus available!",
      };

    if (elapsed <= 600)
      return {
        color: "var(--primary)",
        bonus: "+5 speed bonus available",
      };

    if (elapsed <= 900)
      return {
        color: "var(--primary)",
        bonus: "+2 speed bonus available",
      };

    return {
      color: "var(--muted)",
      bonus: "No speed bonus",
    };
  };

  const { color, bonus } = getInfo();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        background: "var(--card)",

        border: "1px solid var(--border)",

        borderRadius: "12px",

        padding: "12px 16px",

        marginBottom: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "18px" }}>⏱</span>

        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",

            fontSize: "16px",

            fontWeight: 700,

            color,
          }}
        >
          {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </span>
      </div>

      <span
        style={{
          fontSize: "11px",

          fontFamily: "'JetBrains Mono', monospace",

          color,
        }}
      >
        {bonus}
      </span>
    </div>
  );
}
