import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#050816",
        panel: "#0a1227",
        line: "#1b2743",
        signal: {
          green: "#34d399",
          yellow: "#fbbf24",
          red: "#f87171",
          blue: "#60a5fa"
        }
      },
      boxShadow: {
        panel: "0 0 0 1px rgba(148, 163, 184, 0.14), 0 10px 30px rgba(2, 6, 23, 0.38)"
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace"
        ]
      }
    }
  },
  plugins: []
};

export default config;
