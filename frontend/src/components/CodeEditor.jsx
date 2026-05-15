import Editor from "@monaco-editor/react";

const LANG_MAP = {
  python: "python",
  javascript: "javascript",
  java: "java",
  "c++": "cpp",
  typescript: "typescript",
};

export default function CodeEditor({
  value,
  onChange,
  language = "python",
  height = "340px",
  readOnly = false,
}) {
  return (
    <div
      style={{
        border: "1px solid #2a2a3a",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: "1px solid #2a2a3a",
          background: "#0d0d14",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontFamily: "'Space Mono', monospace",
            color: "#6a6a8a",
            textTransform: "uppercase",
            letterSpacing: ".5px",
          }}
        >
          {readOnly ? "solution" : "your code"} · {language}
        </span>

        <div style={{ display: "flex", gap: "5px" }}>
          {["#f06d6d", "#f0b84d", "#4fd1c7"].map((color, index) => (
            <div
              key={index}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: color,
              }}
            />
          ))}
        </div>
      </div>

      {/* MONACO EDITOR */}
      <Editor
        height={height}
        language={LANG_MAP[language?.toLowerCase()] || "python"}
        value={value}
        onChange={(value) => onChange(value || "")}
        theme="vs-dark"
        options={{
          fontSize: 13,
          minimap: { enabled: false },
          padding: {
            top: 14,
            bottom: 14,
          },
          fontFamily: "'Space Mono', monospace",
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly,
          wordWrap: "on",
        }}
      />
    </div>
  );
}
