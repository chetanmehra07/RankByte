import { useState } from "react";
import { getHint, explainSolution } from "../services/api";

export default function HintBox({ challengeId, userCode }) {
  const [hints, setHints] = useState([]);
  const [loading, setLoading] = useState(false);

  const [explanation, setExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);

  // DUMMY USER FOR NOW

  const fetchHint = async () => {
    setLoading(true);

    try {
      const res = await getHint({
        challenge_id: challengeId,
        hints_used: hints.length,
      });

      setHints((prev) => [...prev, res.data.hint]);
    } catch (e) {
      alert(e?.response?.data?.detail || "Failed to get hint");
    }

    setLoading(false);
  };

  const fetchExplanation = async () => {
    setExplaining(true);

    try {
      const res = await explainSolution({
        challenge_id: challengeId,
        user_code: userCode || "// No code submitted yet",
      });

      setExplanation(res.data.explanation);
    } catch (e) {
      alert(e?.response?.data?.detail || "Failed to get explanation");
    }

    setExplaining(false);
  };

  return (
    <div
      style={{
        background: "var(--primary-bg)",
        border: "1px solid #2a2a3a",
        borderRadius: "12px",
        padding: "16px",
        marginTop: "12px",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <span
          style={{
            fontSize: "13px",
            color: "var(--text)",
            fontWeight: 700,
          }}
        >
          💡 Hints & Explanation
        </span>
      </div>

      {/* HINTS */}
      {hints.map((hint, index) => (
        <div
          key={index}
          style={{
            background: "var(--primary-bg)",
            border: "1px solid var(--primary)",
            borderRadius: "8px",
            padding: "10px 12px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontFamily: "'Space Mono', monospace",
              color: "var(--primary)",
              marginBottom: "4px",
            }}
          >
            HINT #{index + 1}
          </div>

          <div
            style={{
              fontSize: "13px",
              color: "var(--text)",
              lineHeight: 1.6,
            }}
          >
            {hint}
          </div>
        </div>
      ))}

      {/* EXPLANATION */}
      {explanation && (
        <div
          style={{
            background: "var(--primary-bg)",
            border: "1px solid var(--primary)",
            borderRadius: "8px",
            padding: "14px",
            marginBottom: "8px",
          }}
        >
          <div
            style={{
              fontSize: "13px",
              fontFamily: "'Space Mono', monospace",
              color: "var(--primary)",
              marginBottom: "8px",
            }}
          >
            OPTIMAL SOLUTION EXPLANATION
          </div>

          <div
            style={{
              fontSize: "13px",
              color: "var(--text)",
              lineHeight: 1.7,
              marginBottom: "10px",
            }}
          >
            {explanation.explanation}
          </div>

          {explanation.key_concepts?.map((concept, index) => (
            <div
              key={index}
              style={{
                fontSize: "12px",
                color: "var(--primary)",
                marginBottom: "2px",
              }}
            >
              • {concept}
            </div>
          ))}

          {explanation.learning_points?.map((point, index) => (
            <div
              key={index}
              style={{
                fontSize: "12px",
                color: "var(--primary)",
                marginBottom: "2px",
              }}
            >
              → {point}
            </div>
          ))}

          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "8px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontFamily: "'Space Mono', monospace",
                color: "var(--text)",
              }}
            >
              ⏱ {explanation.time_complexity}
            </span>

            <span
              style={{
                fontSize: "11px",
                fontFamily: "'Space Mono', monospace",
                color: "var(--text)",
              }}
            >
              💾 {explanation.space_complexity}
            </span>
          </div>
        </div>
      )}

      {/* BUTTONS */}
      <div
        style={{
          display: "flex",
          gap: "8px",
        }}
      >
        <button
          onClick={fetchHint}
          disabled={loading}
          style={{
            flex: 1,
            padding: "10px",
            background: loading ? "var(--muted-bg)" : "var(--primary-bg)",
            color: loading ? "var(--muted)" : "var(--primary)",
            border: `1px solid ${loading ? "var(--muted)" : "var(--primary)"}`,
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {loading
            ? "Getting hint..."
            : `💡 Hint #${hints.length + 1} (-3 pts)`}
        </button>

        <button
          onClick={fetchExplanation}
          disabled={explaining || !!explanation}
          style={{
            flex: 1,
            padding: "10px",
            background:
              explaining || explanation
                ? "var(--muted-bg)"
                : "var(--primary-bg)",
            color:
              explaining || explanation ? "var(--muted)" : "var(--primary)",
            border: `1px solid ${
              explaining || explanation ? "var(--muted)" : "var(--primary)"
            }`,
            borderRadius: "8px",
            cursor: explaining || explanation ? "not-allowed" : "pointer",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {explaining
            ? "Loading..."
            : explanation
              ? "✓ Explained"
              : "🔍 Explain Solution"}
        </button>
      </div>
    </div>
  );
}
