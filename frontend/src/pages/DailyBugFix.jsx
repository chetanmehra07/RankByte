import { useState } from "react";

import CodeEditor from "../components/CodeEditor";
import HintBox from "../components/HintBox";
import TimerDisplay from "../components/TimerDisplay";

import { submitBugFix, completeDaily } from "../services/api";

const card = {
  background: "var(--card)",

  borderRadius: "12px",
};

export default function DailyBugFix({
  challenge,
  onBack,
  setRefreshPoints,
  refreshChallenges,
}) {
  const initialCode = Array.isArray(challenge?.content?.faulty_code_lines)
    ? challenge.content.faulty_code_lines.join("\n")
    : challenge?.content?.buggy_code || "";

  const [code, setCode] = useState(initialCode);

  const [feedback, setFeedback] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [completed, setCompleted] = useState(false);

  const [startTime] = useState(() => Date.now());

  // =========================
  // SUBMIT FIX
  // =========================

  const submit = async () => {
    if (!challenge || submitting || completed) return;

    setSubmitting(true);

    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);

      const res = await submitBugFix({
        challenge_id: challenge.challenge_id,

        daily_challenge_id: challenge.daily_challenge_id,

        submitted_code: code,

        time_taken_seconds: timeTaken,
      });

      setFeedback(res.data);

      if (res.data.is_fixed) {
        await completeDaily({
          challenge_id: challenge.challenge_id,
          daily_challenge_id: challenge.daily_challenge_id,
          answer: code,
        });

        setCompleted(true);

        if (setRefreshPoints) {
          setRefreshPoints((prev) => prev + 1);
        }

        if (refreshChallenges) {
          await refreshChallenges();
        }
      }
    } catch (err) {
      console.error(err);

      alert(err?.response?.data?.detail || "Submission failed.");
    }

    setSubmitting(false);
  };

  return (
    <div
      style={{
        maxWidth: "960px",
        margin: "0 auto",
        padding: "28px",
        fontFamily: "'Syne', sans-serif",
      }}
    >
      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div
        style={{
          display: "flex",

          justifyContent: "space-between",

          alignItems: "center",

          marginBottom: "20px",
        }}
      >
        <button
          onClick={onBack}
          style={{
            padding: "10px 18px",

            background: "var(--primary)",

            color: "#fff",

            borderRadius: "10px",

            cursor: "pointer",

            fontSize: "12px",

            fontFamily: "'Space Mono', monospace",
          }}
        >
          ← Back
        </button>
      </div>

      {/* ========================= */}
      {/* CHALLENGE INFO */}
      {/* ========================= */}

      <div
        style={{
          ...card,
          padding: "20px",
          marginBottom: "16px",
        }}
      >
        {/* BADGE */}

        <div
          style={{
            display: "inline-flex",

            alignItems: "center",

            gap: "8px",

            padding: "6px 14px",

            borderRadius: "999px",

            background: "var(--primary)15",

            border: "1px solid var(--primary)40",

            color: "var(--primary)",

            fontSize: "11px",

            fontFamily: "'Space Mono', monospace",

            marginBottom: "18px",
          }}
        >
          DAILY BUG FIX
        </div>

        {/* TITLE */}

        <div
          style={{
            fontSize: "30px",

            fontFamily: "'Syne', sans-serif",

            fontWeight: 700,

            marginBottom: "14px",

            lineHeight: 1.1,
          }}
        >
          {challenge.title?.replace("[DAILY] ", "")}
        </div>

        {/* DESCRIPTION */}

        <div
          style={{
            fontSize: "14px",

            color: "#6a6a8a",

            fontFamily: "'Syne', sans-serif",

            lineHeight: 1.8,

            whiteSpace: "pre-wrap",
          }}
        >
          {challenge.content?.problem_statement ||
            challenge.content?.description ||
            challenge.description ||
            "Fix the bugs in the given code."}
        </div>

        {/* TAGS */}

        <div
          style={{
            display: "flex",

            gap: "8px",

            marginTop: "16px",

            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: "11px",

              fontFamily: "'Space Mono', monospace",

              padding: "3px 10px",

              borderRadius: "99px",

              border: "1px solid var(--primary)",

              color: "var(--primary)",
            }}
          >
            {challenge.difficulty || "Medium"}
          </span>

          <span
            style={{
              fontSize: "11px",

              fontFamily: "'Space Mono', monospace",

              padding: "3px 10px",

              borderRadius: "99px",

              border: "1px solid #2a2a3a",

              color: "#6a6a8a",
            }}
          >
            +{challenge.bonus_points} XP
          </span>
        </div>
      </div>

      {/* ========================= */}
      {/* MAIN GRID */}
      {/* ========================= */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns: "1fr 1fr",

          gap: "12px",
        }}
      >
        {/* ========================= */}
        {/* LEFT SIDE */}
        {/* ========================= */}

        <div>
          <TimerDisplay startTime={startTime} stopped={completed} />

          <div
            style={{
              fontSize: "12px",

              color: "var(--text)",

              fontFamily: "'Space Mono', monospace",

              marginBottom: "8px",

              marginTop: "12px",
            }}
          >
            Find and fix all the bugs:
          </div>

          <CodeEditor
            value={code}
            onChange={setCode}
            language={challenge.language || "python"}
          />

          <button
            onClick={submit}
            disabled={submitting || completed}
            style={{
              width: "100%",

              padding: "14px",

              background:
                submitting || completed ? "var(--muted-bg)" : "var(--primary)",

              color: submitting || completed ? "var(--muted)" : "#0a0a0f",

              border: "none",

              borderRadius: "10px",

              fontSize: "14px",

              fontWeight: 700,

              cursor: submitting || completed ? "not-allowed" : "pointer",

              marginTop: "10px",
            }}
          >
            {submitting
              ? "AI is reviewing your fix..."
              : completed
                ? "Challenge Completed ✅"
                : "Submit Fix →"}
          </button>

          <HintBox
            challengeId={challenge.challenge_id}
            challengeDescription={challenge.description}
            language={challenge.language || "python"}
            userCode={code}
          />
        </div>

        {/* ========================= */}
        {/* RIGHT SIDE */}
        {/* ========================= */}

        <div
          style={{
            ...card,

            padding: "20px",
          }}
        >
          {!feedback ? (
            <div
              style={{
                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                minHeight: "220px",

                flexDirection: "column",

                gap: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "36px",
                }}
              >
                🔍
              </div>

              <div
                style={{
                  fontSize: "13px",

                  color: "#6a6a8a",
                }}
              >
                Fix the bugs then submit for AI review
              </div>
            </div>
          ) : (
            <div>
              {/* SCORE */}

              <div
                style={{
                  fontSize: "48px",

                  fontWeight: 800,

                  fontFamily: "'Space Mono', monospace",

                  color: feedback.is_fixed ? "var(--primary)" : "#f06d6d",
                }}
              >
                {feedback.score}
              </div>

              {/* STATUS */}

              <div
                style={{
                  fontSize: "11px",

                  color: "#6a6a8a",

                  fontFamily: "'Space Mono', monospace",

                  textTransform: "uppercase",

                  letterSpacing: ".5px",

                  marginBottom: "12px",
                }}
              >
                {feedback.is_fixed
                  ? "✅ All bugs fixed!"
                  : "⚠️ Some bugs remain"}
              </div>

              {/* FEEDBACK */}

              <div
                style={{
                  fontSize: "13px",

                  color: "#a0a0c0",

                  lineHeight: 1.7,

                  marginBottom: "10px",
                }}
              >
                {feedback.ai_feedback?.feedback}
              </div>

              {/* FIXED */}

              {feedback.ai_feedback?.bugs_correctly_fixed?.map((b, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: "12px",

                    color: "var(--primary)",

                    marginBottom: "3px",
                  }}
                >
                  ✓ {b}
                </div>
              ))}

              {/* MISSED */}

              {feedback.ai_feedback?.bugs_missed?.map((b, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: "12px",

                    color: "#f06d6d",

                    marginBottom: "3px",
                  }}
                >
                  ✗ {b}
                </div>
              ))}

              {/* REWARD */}

              {feedback.total_earned > 0 && (
                <div
                  style={{
                    marginTop: "14px",

                    padding: "12px",

                    background: "var(--primary-bg)",

                    borderRadius: "8px",

                    fontFamily: "'Space Mono', monospace",

                    fontSize: "12px",
                  }}
                >
                  <div
                    style={{
                      color: "var(--primary)",
                    }}
                  >
                    🎉 +{feedback.points_earned} pts earned!
                  </div>

                  {feedback.time_bonus > 0 && (
                    <div
                      style={{
                        color: "#f0b84d",

                        marginTop: "4px",
                      }}
                    >
                      ⚡ +{feedback.time_bonus} speed bonus!
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
