import { useState } from "react";

import CodeEditor from "../components/CodeEditor";
import HintBox from "../components/HintBox";
import TimerDisplay from "../components/TimerDisplay";

import { generateChallenge, submitBugFix } from "../services/api";

import heroImage from "../assets/bugHero5.png";

const LANGUAGES = ["Python", "JavaScript", "Java", "C++", "TypeScript"];

const card = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "20px",
  backdropFilter: "blur(16px)",
};

export default function BugFixer({ setRefreshPoints }) {
  const [lang, setLang] = useState("Python");

  const [challenge, setChallenge] = useState(null);

  const [code, setCode] = useState("");

  const [feedback, setFeedback] = useState(null);

  const [loading, setLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [completed, setCompleted] = useState(false);

  const [startTime, setStartTime] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [timerStopped, setTimerStopped] = useState(false);
  const [, setRemainingQuestions] = useState(10);

  const [limitReached, setLimitReached] = useState(false);

  // =========================
  // GENERATE CHALLENGE
  // =========================

  const generate = async () => {
    setLoading(true);

    setFeedback(null);

    setChallenge(null);

    setCompleted(false);

    setStartTime(Date.now());

    try {
      const res = await generateChallenge({
        language: lang,

        challenge_type: "BUG_FIX",
      });

      setChallenge(res.data);
      setRemainingQuestions(res.data.remaining_questions ?? 0);

      setCode(
        res.data.content?.faulty_code_lines?.join("\n") ||
          res.data.faulty_code_lines?.join("\n") ||
          "",
      );
    } catch (err) {
      console.error(err);

      // =========================
      // DAILY LIMIT REACHED
      // =========================

      if (
        err?.response?.status === 403 &&
        err?.response?.data?.detail?.limit_reached
      ) {
        setLimitReached(true);

        setRemainingQuestions(0);

        setLoading(false);

        return;
      }

      alert("Failed to generate challenge.");
    }

    setLoading(false);
  };

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

        submitted_code: code,

        time_taken_seconds: timeTaken,
      });

      setFeedback(res.data);
      setSubmitted(true);

      setTimerStopped(true);

      if (res.data.is_fixed) {
        setCompleted(true);
        setRefreshPoints((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);

      alert(err?.response?.data?.detail || "Submission failed.");
    }

    setSubmitting(false);
  };

  // =========================
  // RESET CHALLENGE
  // =========================

  return (
    <div
      style={{
        maxWidth: "1300px",
        margin: "0 auto",
        padding: "32px 40px 60px",
        color: "var(--text)",
      }}
    >
      {/* ========================= */}
      {/* HERO SECTION */}
      {/* ========================= */}

      {!challenge ? (
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

          {/* ========================= */}
          {/* LEFT SIDE */}
          {/* ========================= */}

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
              Bug Fix Challenge
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
              Solve real-world
              <span
                style={{
                  color: "var(--primary)",

                  display: "block",
                }}
              >
                debugging challenges
              </span>
            </h1>

            {/* DESCRIPTION */}
            <p
              style={{
                fontSize: "16px",

                lineHeight: 1.8,

                color: "var(--muted)",

                maxWidth: "700px",

                marginBottom: "10px",
              }}
            >
              Practice debugging broken code, fixing runtime issues, and
              sharpening your problem-solving skills through AI-generated
              challenges.
            </p>

            {/* LANGUAGE SELECTOR */}
            <div
              style={{
                display: "flex",

                gap: "10px",

                flexWrap: "wrap",

                marginBottom: "30px",
              }}
            >
              {LANGUAGES.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    padding: "10px 18px",

                    borderRadius: "12px",

                    border: `1px solid ${
                      lang === l ? "var(--primary)" : "rgba(255,255,255,0.08)"
                    }`,

                    background:
                      lang === l
                        ? "rgba(249,115,22,0.12)"
                        : "rgba(255,255,255,0.03)",

                    color: lang === l ? "var(--primary)" : "var(--muted)",

                    cursor: "pointer",

                    fontFamily: "'Space Mono', monospace",

                    fontSize: "13px",

                    transition: ".2s",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* BUTTON */}
            <button
              onClick={generate}
              disabled={loading || limitReached}
              style={{
                padding: "18px 36px",

                background: limitReached ? "#374151" : "var(--primary)",

                color: "#fff",

                border: "none",

                borderRadius: "18px",

                fontWeight: 700,

                fontSize: "17px",

                transition: ".25s",

                opacity: limitReached ? 0.6 : 1,

                cursor: limitReached ? "not-allowed" : "pointer",
              }}
            >
              {limitReached
                ? "Daily AI Limit Reached"
                : loading
                  ? "AI is generating buggy code..."
                  : "Generate Buggy Code"}
            </button>
          </div>

          {/* ========================= */}
          {/* RIGHT SIDE */}
          {/* ========================= */}

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

                maxWidth: "380px",

                objectFit: "contain",

                position: "relative",

                zIndex: 2,
              }}
            />
          </div>
        </div>
      ) : (
        <div>
          {/* ========================= */}
          {/* CHALLENGE INFO */}
          {/* ========================= */}

          <div
            style={{
              ...card,

              padding: "24px",

              marginBottom: "20px",
            }}
          >
            <div
              style={{
                fontSize: "28px",

                fontWeight: 700,

                marginBottom: "12px",
              }}
            >
              {challenge.title}
            </div>

            <div
              style={{
                fontSize: "15px",

                color: "var(--muted)",

                lineHeight: 1.8,
              }}
            >
              {challenge.description}
            </div>

            <div
              style={{
                display: "flex",

                gap: "10px",

                marginTop: "18px",

                flexWrap: "wrap",
              }}
            >
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

          {/* ========================= */}
          {/* MAIN GRID */}
          {/* ========================= */}

          <div
            style={{
              display: "grid",

              gridTemplateColumns: "1fr 380px",

              gap: "24px",

              alignItems: "start",
            }}
          >
            {/* ========================= */}
            {/* LEFT SIDE */}
            {/* ========================= */}

            <div>
              <TimerDisplay startTime={startTime} stopped={timerStopped} />

              <div
                style={{
                  fontSize: "13px",

                  color: "var(--muted)",

                  fontFamily: "'Space Mono', monospace",

                  marginBottom: "10px",

                  marginTop: "10px",
                }}
              >
                Find and fix all the bugs:
              </div>

              <CodeEditor value={code} onChange={setCode} language={lang} />

              {/* SUBMIT BUTTON */}
              <button
                onClick={submit}
                disabled={submitting || submitted}
                style={{
                  marginTop: "18px",

                  padding: "14px 24px",

                  background: submitted
                    ? "#374151"
                    : "linear-gradient(135deg, #f97316, #ea580c)",

                  color: "#fff",

                  border: "none",

                  borderRadius: "14px",

                  fontWeight: 700,

                  cursor: submitted ? "not-allowed" : "pointer",

                  opacity: submitted ? 0.7 : 1,
                }}
              >
                {submitted
                  ? "Already Submitted"
                  : submitting
                    ? "Submitting..."
                    : "Submit Solution"}
              </button>
              {/* RESET BUTTON */}

              <div style={{ marginTop: "18px" }}>
                <HintBox
                  challengeId={challenge.challenge_id}
                  challengeDescription={challenge.description}
                  language={lang}
                  userCode={code}
                />
              </div>
            </div>

            {/* ========================= */}
            {/* RIGHT SIDE */}
            {/* ========================= */}

            <div
              style={{
                ...card,

                padding: "24px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",

                  letterSpacing: "2px",

                  textTransform: "uppercase",

                  color: "var(--muted)",

                  marginBottom: "18px",

                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                AI Evaluation
              </div>

              {!feedback ? (
                <div
                  style={{
                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center",

                    minHeight: "280px",

                    flexDirection: "column",

                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "50px",
                    }}
                  >
                    🔍
                  </div>

                  <div
                    style={{
                      fontSize: "14px",

                      color: "var(--muted)",

                      textAlign: "center",

                      lineHeight: 1.7,
                    }}
                  >
                    Fix the bugs and submit your code for AI-powered evaluation.
                  </div>
                </div>
              ) : (
                <div>
                  {/* SCORE */}
                  <div
                    style={{
                      fontSize: "56px",

                      fontWeight: 800,

                      fontFamily: "'Space Mono', monospace",

                      color: "var(--primary)",

                      marginBottom: "6px",
                    }}
                  >
                    {feedback.score}
                  </div>

                  {/* STATUS */}
                  <div
                    style={{
                      fontSize: "12px",

                      color: "var(--muted)",

                      fontFamily: "'Space Mono', monospace",

                      textTransform: "uppercase",

                      letterSpacing: ".5px",

                      marginBottom: "16px",
                    }}
                  >
                    {feedback.is_fixed
                      ? "✅ All bugs fixed!"
                      : "⚠️ Some bugs remain"}
                  </div>

                  {/* FEEDBACK */}
                  <div
                    style={{
                      fontSize: "14px",

                      color: "var(--muted)",

                      lineHeight: 1.8,

                      marginBottom: "16px",
                    }}
                  >
                    {feedback.ai_feedback?.feedback}
                  </div>

                  {/* FIXED BUGS */}
                  {feedback.ai_feedback?.bugs_correctly_fixed?.length > 0 && (
                    <div style={{ marginBottom: "18px" }}>
                      <div
                        style={{
                          fontWeight: 700,

                          marginBottom: "8px",

                          color: "#22c55e",
                        }}
                      >
                        Fixed Successfully
                      </div>

                      {feedback.ai_feedback.bugs_correctly_fixed.map((b, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: "14px",

                            color: "var(--muted)",

                            marginBottom: "6px",
                          }}
                        >
                          ✓ {b}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* MISSED BUGS */}
                  {feedback.ai_feedback?.bugs_missed?.length > 0 && (
                    <div style={{ marginBottom: "18px" }}>
                      <div
                        style={{
                          fontWeight: 700,

                          marginBottom: "8px",

                          color: "#ef4444",
                        }}
                      >
                        Bugs Missed
                      </div>

                      {feedback.ai_feedback.bugs_missed.map((b, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: "14px",

                            color: "var(--muted)",

                            marginBottom: "6px",
                          }}
                        >
                          ✗ {b}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* POINTS */}
                  {feedback.total_earned > 0 && (
                    <div
                      style={{
                        marginTop: "18px",

                        padding: "14px",

                        background: "rgba(249,115,22,0.08)",

                        borderRadius: "14px",

                        border: "1px solid rgba(249,115,22,0.15)",

                        fontFamily: "'Space Mono', monospace",

                        fontSize: "13px",
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
                            color: "#f59e0b",

                            marginTop: "6px",
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
      )}
      {/* ========================= */}
      {/* LIMIT POPUP */}
      {/* ========================= */}

      {limitReached && (
        <div
          style={{
            position: "fixed",

            top: 0,

            left: 0,

            width: "100vw",

            height: "100vh",

            background: "rgba(0,0,0,0.7)",

            backdropFilter: "blur(8px)",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "90%",

              maxWidth: "500px",

              background: "var(--card)",

              border: "1px solid var(--border)",

              borderRadius: "28px",

              padding: "40px",

              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontSize: "30px",

                marginBottom: "15px",
              }}
            >
              Daily AI Limit Reached
            </h2>

            <p
              style={{
                color: "var(--muted)",

                lineHeight: 1.8,

                fontSize: "15px",

                marginBottom: "30px",
              }}
            >
              You've used all 10 free AI-generated challenges for today. Come
              back tomorrow for more debugging practice.
            </p>

            <button
              onClick={() => setLimitReached(false)}
              style={{
                padding: "14px 28px",

                background: "var(--primary)",

                border: "none",

                borderRadius: "14px",

                color: "#fff",

                fontWeight: 700,

                cursor: "pointer",
              }}
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
