import { useState } from "react";

import TimerDisplay from "../components/TimerDisplay";

import { generateChallenge, submitSystemDesign } from "../services/api";
import heroImage from "../assets/heroImage.svg";

export default function SystemDesign({ setRefreshPoints }) {
  const [challenge, setChallenge] = useState(null);

  const [loading, setLoading] = useState(false);

  const [answer, setAnswer] = useState("");

  const [result, setResult] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const [timerStopped, setTimerStopped] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const clerkId = "test_user_1";

  const [startTime, setStartTime] = useState(() => Date.now());

  const generate = async () => {
    try {
      setLoading(true);

      setResult(null);

      setAnswer("");

      setSubmitted(false);

      setTimerStopped(false);

      setStartTime(Date.now());

      const res = await generateChallenge({
        language: "python",
        challenge_type: "SYSTEM_DESIGN",
      });

      setChallenge(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    if (!challenge || !answer.trim()) return;

    try {
      setSubmitting(true);

      const res = await submitSystemDesign({
        clerk_id: clerkId,

        challenge_id: challenge.challenge_id,

        answer_text: answer,

        time_taken_seconds: Math.floor((Date.now() - startTime) / 1000),
      });

      setResult(res.data);

      setSubmitted(true);

      setTimerStopped(true);
      setRefreshPoints((prev) => prev + 1);
    } catch (err) {
      console.error(err.response?.data || err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "1300px",

        margin: "0 auto",

        padding: "32px 40px 60px",

        color: "var(--text)",
      }}
    >
      {/* HERO */}
      {!challenge && (
        <div
          style={{
            position: "relative",

            overflow: "hidden",

            width: "100%",

            display: "grid",

            gridTemplateColumns: "55% 45%",

            gap: "30px",

            background: "var(--card)",

            border: "1px solid var(--border)",

            borderRadius: "36px",

            padding: "50px",

            marginBottom: "15px",

            backdropFilter: "blur(18px)",
          }}
        >
          {/* GLOW */}
          <div
            style={{
              position: "absolute",

              width: "520px",

              height: "520px",

              borderRadius: "50%",

              filter: "blur(120px)",

              top: "-140px",

              right: "-120px",
            }}
          />

          {/* LEFT CONTENT */}
          <div
            style={{
              position: "relative",

              zIndex: 1,
            }}
          >
            {/* TAG */}
            <div
              style={{
                display: "inline-flex",

                alignItems: "center",

                gap: "8px",

                padding: "0px 6px",

                color: "var(--primary)",

                fontSize: "15px",

                fontWeight: 700,

                letterSpacing: "2px",

                textTransform: "uppercase",

                marginBottom: "15px",

                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              System Design
            </div>

            {/* TITLE */}
            <h1
              style={{
                fontSize: "45px",

                lineHeight: 0.95,

                fontWeight: 700,

                margin: 0,

                marginBottom: "15px",

                letterSpacing: "0px",

                maxWidth: "720px",
              }}
            >
              Design scalable
              <span
                style={{
                  color: "var(--primary)",

                  display: "block",
                }}
              >
                architectures
              </span>
            </h1>

            {/* SUBTITLE */}
            <p
              style={{
                fontSize: "16px",

                lineHeight: 1.8,

                color: "var(--muted)",

                maxWidth: "700px",

                marginBottom: "10px",
              }}
            >
              Practice real-world system design challenges involving
              scalability, distributed systems, caching, databases, event
              streaming, and large-scale architecture decisions.
            </p>

            {/* BUTTON */}
            <button
              onClick={generate}
              disabled={loading}
              style={{
                padding: "18px 36px",

                background: "var(--primary)",

                color: "#fff",

                border: "none",

                borderRadius: "18px",

                fontWeight: 700,

                fontSize: "17px",

                cursor: "pointer",

                transition: ".25s",
              }}
            >
              {loading ? "Generating..." : "Generate Challenge"}
            </button>
          </div>

          {/* RIGHT SIDE IMAGE */}
          <div
            style={{
              position: "relative",

              display: "flex",

              justifyContent: "center",

              alignItems: "center",

              height: "100%",

              zIndex: 2,
            }}
          >
            <img
              src={heroImage}
              alt="System Design"
              style={{
                width: "100%",

                maxWidth: "300px",

                objectFit: "contain",

                position: "relative",

                zIndex: 2,
              }}
            />
          </div>
        </div>
      )}

      {/* Challenge */}
      {challenge && (
        <div
          style={{
            background: "var(--card)",

            border: "1px solid var(--border)",

            borderRadius: "36px",

            padding: "40px",

            backdropFilter: "blur(18px)",
          }}
        >
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

              <div
                style={{
                  background: "rgba(255,255,255,0.02)",

                  border: "1px solid var(--border)",

                  borderRadius: "20px",

                  padding: "24px",

                  marginBottom: "18px",
                }}
              >
                <h2
                  style={{
                    marginTop: 0,

                    marginBottom: "14px",

                    fontSize: "24px",
                  }}
                >
                  {challenge.title}
                </h2>

                <p
                  style={{
                    lineHeight: 1.8,

                    color: "var(--muted)",
                  }}
                >
                  {challenge.description}
                </p>
                <div
                  style={{
                    display: "flex",

                    gap: "10px",

                    marginTop: "18px",

                    flexWrap: "wrap",
                  }}
                >
                  {/* Difficulty */}
                  <span
                    style={{
                      fontSize: "12px",

                      fontFamily: "'Space Mono', monospace",

                      padding: "6px 12px",

                      borderRadius: "999px",

                      border: "1px solid var(--primary)",

                      color: "var(--primary)",
                    }}
                  >
                    {challenge.difficulty}
                  </span>

                  {/* User Level */}
                  <span
                    style={{
                      fontSize: "12px",

                      fontFamily: "'Space Mono', monospace",

                      padding: "6px 12px",

                      borderRadius: "999px",

                      border: "1px solid var(--border)",

                      color: "var(--muted)",
                    }}
                  >
                    {challenge.user_level} Level
                  </span>

                  {/* Points */}
                  <span
                    style={{
                      fontSize: "12px",

                      fontFamily: "'Space Mono', monospace",

                      padding: "6px 12px",

                      borderRadius: "999px",

                      border: "1px solid var(--border)",

                      color: "var(--muted)",
                    }}
                  >
                    +{challenge.points_reward} pts
                  </span>
                </div>
              </div>

              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Write your architecture explanation..."
                style={{
                  width: "100%",

                  minHeight: "260px",

                  background: "rgba(255,255,255,0.02)",

                  border: "1px solid var(--border)",

                  borderRadius: "20px",

                  padding: "18px",

                  color: "var(--text)",

                  resize: "vertical",

                  fontSize: "15px",

                  outline: "none",
                }}
              />

              <button
                onClick={submit}
                disabled={submitting || submitted}
                style={{
                  marginTop: "18px",

                  padding: "14px 24px",

                  background: submitted
                    ? "#4b5563"
                    : "linear-gradient(135deg, #f97316, #ea580c)",

                  color: "#fff",

                  border: "none",

                  borderRadius: "14px",

                  fontWeight: 700,

                  cursor: submitted ? "not-allowed" : "pointer",

                  opacity: submitted ? 0.85 : 1,

                  transition: "0.25s",
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
                  background: "rgba(255,255,255,0.02)",

                  border: "1px solid var(--border)",

                  borderRadius: "20px",

                  padding: "22px",
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
      )}
    </div>
  );
}
