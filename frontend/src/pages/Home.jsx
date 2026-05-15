import { Link } from "react-router-dom";

const FEATURES = [
  {
    title: "Bug Fixer",
    desc: "Find and fix intentional bugs. Challenges evolve as your skills improve.",
    color: "#4fd1c7",
  },

  {
    title: "System Design",
    desc: "Design scalable systems from simple apps to distributed architectures.",
    color: "#f0b84d",
  },

  {
    title: "Daily Challenge",
    desc: "Complete daily missions to earn bonus XP and maintain your streak.",
    color: "#f06d6d",
  },

  {
    title: "AI Hints",
    desc: "Get intelligent hints without revealing the full solution.",
    color: "#14b8a6",
  },

  {
    title: "Language Mastery",
    desc: "Track mastery across programming languages over time.",
    color: "#ff6bff",
  },
];

const LEVELS = [
  {
    name: "Beginner",
    pts: "0–100",
    color: "var(--primary)",
  },

  {
    name: "Developer",
    pts: "101–300",
    color: "var(--primary)",
  },

  {
    name: "Pro",
    pts: "301–700",
    color: "var(--primary)",
  },

  {
    name: "Expert",
    pts: "701–1500",
    color: "var(--primary)",
  },

  {
    name: "Master",
    pts: "1500+",
    color: "var(--primary)",
  },
];

export default function Home() {
  return (
    <div
      style={{
        background: "var(--bg)",

        minHeight: "100vh",

        color: "var(--text)",

        transition: "background .25s ease, color .25s ease",
      }}
    >
      {/* HERO */}
      <div
        style={{
          maxWidth: "1200px",

          margin: "0 auto",

          padding: "90px 24px 70px 24px",

          textAlign: "center",

          position: "relative",
        }}
      >
        <div
          style={{
            position: "relative",

            zIndex: 1,
          }}
        >
          {/* TOP LABEL */}
          <div
            style={{
              fontSize: "12px",

              fontFamily: "'Space Mono', monospace",

              color: "var(--primary)",

              textTransform: "uppercase",

              letterSpacing: "3px",

              marginBottom: "20px",
            }}
          >
            AI-Powered Developer Platform
          </div>

          {/* MAIN TITLE */}
          <h1
            style={{
              fontSize: "clamp(60px, 5vw, 50px)",

              fontWeight: 700,

              lineHeight: 1,

              marginBottom: "28px",

              color: "var(--text)",
            }}
          >
            Build your
            <br />
            <span
              style={{
                background:
                  "linear-gradient(90deg,var(--primary),var(--primary)  )",

                WebkitBackgroundClip: "text",

                WebkitTextFillColor: "transparent",
              }}
            >
              coding skills
            </span>{" "}
            with AI
          </h1>

          {/* SUBTITLE */}
          <p
            style={{
              fontSize: "18px",

              color: "var(--muted)",

              lineHeight: 1.8,

              maxWidth: "760px",

              margin: "0 auto 44px auto",
            }}
          >
            Solve AI-generated coding bugs, debug real-world issues, improve
            system design skills, and level up through an adaptive developer
            progression system.
          </p>

          {/* BUTTONS */}
          <div
            style={{
              display: "flex",

              justifyContent: "center",

              gap: "18px",

              flexWrap: "wrap",
            }}
          >
            <Link
              to="/dashboard"
              style={{
                background: "var(--primary)",

                color: "#fff",

                padding: "16px 36px",

                borderRadius: "16px",

                fontWeight: 700,

                fontSize: "15px",

                boxShadow: "0 8px 30px rgba(64, 62, 83, 0.25)",

                transition: ".25s ease",
              }}
            >
              Launch Platform →
            </Link>

            <Link
              to="/leaderboard"
              style={{
                background: "var(--card)",

                color: "var(--text)",

                border: "1px solid var(--border)",

                padding: "16px 36px",

                borderRadius: "16px",

                fontWeight: 700,

                fontSize: "15px",

                boxShadow: "var(--shadow)",
              }}
            >
              View Leaderboard
            </Link>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div
        style={{
          maxWidth: "1200px",

          margin: "0 auto",

          padding: "0 24px 90px 24px",
        }}
      >
        {/* SECTION TITLE */}
        <div
          style={{
            textAlign: "center",

            marginBottom: "50px",
          }}
        >
          <div
            style={{
              fontSize: "13px",

              fontFamily: "'Space Mono', monospace",

              color: "var(--primary)",

              letterSpacing: "2px",
              fontWeight: 500,

              textTransform: "uppercase",

              marginBottom: "14px",
            }}
          >
            Platform Features
          </div>

          <h2
            style={{
              fontSize: "clamp(28px,4vw,32px)",

              fontWeight: 600,

              color: "var(--text)",

              marginBottom: "14px",
            }}
          >
            Everything needed to
            <br />
            grow as a developer
          </h2>

          <p
            style={{
              color: "var(--muted)",

              fontSize: "15px",

              lineHeight: 1.8,

              maxWidth: "620px",

              margin: "0 auto",
            }}
          >
            solve bugs, improve architecture skills, and track your developer
            progression through AI-powered challenges.
          </p>
        </div>

        {/* FEATURE GRID */}
        <div
          style={{
            display: "grid",

            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",

            gap: "22px",
          }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="card-hover"
              style={{
                background: "var(--card)",

                border: "1px solid var(--border)",

                borderRadius: "22px",

                padding: "28px",

                transition: "all .25s ease",

                boxShadow: "var(--shadow)",
              }}
            >
              {/* ICON */}

              {/* TITLE */}
              <div
                style={{
                  fontSize: "22px",

                  fontWeight: 700,

                  marginBottom: "14px",

                  color: "var(--primary)",

                  letterSpacing: "-0.5px",
                }}
              >
                {f.title}
              </div>

              {/* DESCRIPTION */}
              <div
                style={{
                  fontSize: "15px",

                  color: "var(--muted)",

                  lineHeight: 1.9,
                }}
              >
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* LEVEL SYSTEM */}
      <div
        style={{
          maxWidth: "1200px",

          margin: "0 auto",

          padding: "0 24px 90px 24px",
        }}
      >
        <div
          className="shadow"
          style={{
            background: "var(--card)",

            border: "1px solid var(--border)",

            borderRadius: "24px",

            padding: "34px",
          }}
        >
          <div
            style={{
              textAlign: "center",

              fontSize: "12px",

              fontFamily: "'Space Mono', monospace",

              color: "var(--muted)",

              letterSpacing: "2px",

              textTransform: "uppercase",

              marginBottom: "28px",
            }}
          >
            Adaptive Difficulty System
          </div>

          <div
            style={{
              display: "grid",

              gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",

              gap: "18px",
            }}
          >
            {LEVELS.map((l, i) => (
              <div
                key={i}
                style={{
                  background: "var(--card-hover)",

                  border: "1px solid var(--border)",

                  borderRadius: "18px",

                  padding: "22px",

                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "16px",

                    fontWeight: 700,

                    color: l.color,

                    marginBottom: "8px",

                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  {l.name}
                </div>

                <div
                  style={{
                    fontSize: "13px",

                    color: "var(--muted)",
                  }}
                >
                  {l.pts} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
