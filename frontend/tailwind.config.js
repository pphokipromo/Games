/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0f",
        surface: "#13131f",
        panel: "#1a1a2e",
        card: "#1f1f35",
        border: "#2a2a45",
        accent: "#7c3aed",
        "accent-hover": "#6d28d9",
        "accent-light": "#a78bfa",
        neon: "#c026d3",
        gold: "#f59e0b",
        success: "#10b981",
        danger: "#ef4444",
        muted: "#6b7280",
        "text-primary": "#f1f0ff",
        "text-secondary": "#9ca3af",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "slide-up": "slideUp 0.3s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px #7c3aed44" },
          "100%": { boxShadow: "0 0 20px #7c3aed88, 0 0 40px #7c3aed22" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
