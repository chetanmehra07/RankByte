import { useState } from "react";

import TimerDisplay from "../components/TimerDisplay";
import { submitSystemDesign, completeDaily } from "../services/api";

export default function DailySystemDesign({
  challenge,
  onBack,
  setRefreshPoints,
  refreshChallenges,
}) {
  const [answer, setAnswer] = useState("");

  const [result, setResult] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [timerStopped, setTimerStopped] = useState(false);

  const [submitted, setSubmitted] = useState(
    challenge?.already_completed || false,
  );

  const [startTime] = useState(() => Date.now());

  // =====================================================
  // SUBMIT
  // =====================================================

  const submit = async () => {
    if (!challenge || !answer.trim()) return;

    try {
      setSubmitting(true);

      const res = await submitSystemDesign({
        challenge_id: challenge.challenge_id,

        daily_challenge_id: challenge.daily_challenge_id,

        answer_text: answer,

        time_taken_seconds: Math.floor((Date.now() - startTime) / 1000),
      });

      setResult(res.data);

      await completeDaily({
        challenge_id: challenge.challenge_id,
        daily_challenge_id: challenge.daily_challenge_id,
        answer: answer,
      });

      setSubmitted(true);

      setTimerStopped(true);

      if (setRefreshPoints) {
        setRefreshPoints((prev) => prev + 1);
      }

      if (refreshChallenges) {
        await refreshChallenges();
      }
    } catch (err) {
      console.error(err.response?.data || err);
    } finally {
      setSubmitting(false);
    }
  };
  console.log("DAILY CHALLENGE:", challenge);
  return (
    <div
      style={{
        maxWidth: "1300px",
        margin: "0 auto",
        padding: "32px 40px 60px",
        color: "var(--text)",
      }}
    >
      {/* BACK */}

      <button
        onClick={onBack}
        style={{
          marginBottom: "20px",

          padding: "10px 18px",

          background: "var(--primary)",

          borderRadius: "12px",

          color: "#fff",

          cursor: "pointer",

          fontWeight: 600,
        }}
      >
        ← Back
      </button>

      {/* MAIN */}

      <div
        style={{
          display: "grid",

          gridTemplateColumns: "1fr 380px",

          gap: "24px",
        }}
      >
        {/* LEFT */}

        <div>
          <TimerDisplay startTime={startTime} stopped={timerStopped} />

          {/* QUESTION */}

          <div
            style={{
              background: "var(--card)",

              border: "1px solid var(--border)",

              borderRadius: "16px",

              padding: "24px",

              marginBottom: "18px",

              marginTop: "18px",
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

                background: "var(--primary-bg)",

                border: "1px solid var(--primary)",

                color: "var(--primary)",

                fontSize: "11px",

                fontFamily: "'JetBrains Mono', monospace",

                marginBottom: "18px",
              }}
            >
              DAILY SYSTEM DESIGN
            </div>

            {/* TITLE */}

            <h2
              style={{
                marginTop: 0,

                marginBottom: "14px",

                fontSize: "20px",

                lineHeight: 1.05,

                fontWeight: 700,
              }}
            >
              {challenge.title?.replace("[DAILY] ", "")}
            </h2>

            {/* DESC */}

            <div
              style={{
                lineHeight: 1.8,

                color: "var(--muted)",

                fontSize: "15px",

                marginBottom: "24px",

                whiteSpace: "pre-wrap",
              }}
            >
              {challenge.content?.problem_statement ||
                challenge.content?.question ||
                challenge.content?.description ||
                challenge.problem_statement ||
                challenge.description ||
                "No description available."}
            </div>

            {/* XP */}

            <div
              style={{
                display: "inline-flex",

                alignItems: "center",

                gap: "10px",

                padding: "12px 18px",

                background: "var(--primary-bg)",

                border: "1px solid var(--primary)",

                borderRadius: "14px",

                fontFamily: "'JetBrains Mono', monospace",

                color: "var(--primary)",

                fontWeight: 700,
              }}
            >
              🏆 +{challenge.bonus_points} XP
            </div>
          </div>

          {/* ANSWER */}

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write your architecture explanation..."
            style={{
              width: "100%",

              minHeight: "260px",

              background: "var(--card)",

              border: "1px solid var(--border)",

              borderRadius: "16px",

              padding: "18px",

              color: "var(--text)",

              resize: "vertical",

              fontSize: "15px",

              outline: "none",
            }}
          />

          {/* BUTTON */}

          <button
            onClick={submit}
            disabled={submitting || submitted}
            style={{
              marginTop: "18px",

              padding: "12px 22px",

              background: "var(--primary)",

              color: "#fff",

              border: "none",

              borderRadius: "10px",

              fontWeight: 600,

              cursor: "pointer",
            }}
          >
            {submitted
              ? "Already Submitted"
              : submitting
                ? "Submitting..."
                : "Submit Solution"}
          </button>
        </div>

        {/* RIGHT */}

        <div>
          <div
            style={{
              background: "var(--card)",

              border: "1px solid var(--border)",

              borderRadius: "16px",

              padding: "22px",

              marginTop: "70px",
            }}
          >
            <div
              style={{
                fontSize: "13px",

                letterSpacing: "2px",

                textTransform: "uppercase",

                color: "var(--muted)",

                marginBottom: "18px",

                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Evaluation
            </div>

            {result ? (
              <>
                {/* SCORE */}

                <div
                  style={{
                    fontSize: "42px",

                    fontWeight: 700,

                    color: "var(--primary)",

                    marginBottom: "16px",
                  }}
                >
                  {result.score}
                </div>

                {/* FEEDBACK */}

                <div
                  style={{
                    color: "var(--muted)",

                    lineHeight: 1.8,

                    marginBottom: "18px",
                  }}
                >
                  {result.ai_feedback?.feedback}
                </div>

                {/* GOOD */}

                {result.ai_feedback?.what_was_good?.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        fontWeight: 700,

                        marginBottom: "8px",

                        color: "#22c55e",
                      }}
                    >
                      What Was Good
                    </div>

                    {result.ai_feedback.what_was_good.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          color: "var(--muted)",

                          marginBottom: "6px",

                          fontSize: "14px",
                        }}
                      >
                        • {item}
                      </div>
                    ))}
                  </div>
                )}

                {/* MISSING */}

                {result.ai_feedback?.what_was_missing?.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        fontWeight: 700,

                        marginBottom: "8px",

                        color: "#ef4444",
                      }}
                    >
                      What Was Missing
                    </div>

                    {result.ai_feedback.what_was_missing.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          color: "var(--muted)",

                          marginBottom: "6px",

                          fontSize: "14px",
                        }}
                      >
                        • {item}
                      </div>
                    ))}
                  </div>
                )}

                {/* IMPROVEMENTS */}

                {result.ai_feedback?.suggested_improvements?.length > 0 && (
                  <div>
                    <div
                      style={{
                        fontWeight: 700,

                        marginBottom: "8px",

                        color: "#f59e0b",
                      }}
                    >
                      Suggested Improvements
                    </div>

                    {result.ai_feedback.suggested_improvements.map(
                      (item, i) => (
                        <div
                          key={i}
                          style={{
                            color: "var(--muted)",

                            marginBottom: "6px",

                            fontSize: "14px",
                          }}
                        >
                          • {item}
                        </div>
                      ),
                    )}
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: "var(--muted)" }}>
                Submit your design to get AI evaluation and scoring.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
