/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0D16",
        surface: "#12172A",
        surface2: "#1A2138",
        surface3: "#232C4A",
        border: "#2A3355",
        accent: "#7C5CFC",
        accent2: "#5B8CFF",
        amber: "#F5A623",
        success: "#34D399",
        text: "#E7EAF3",
        muted: "#8C96B4",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(124,92,252,0.4), 0 0 24px rgba(124,92,252,0.25)",
      },
    },
  },
  plugins: [],
}

