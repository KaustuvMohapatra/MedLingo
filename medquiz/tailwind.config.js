/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "med-purple": "#5B21B6",
        "med-purple-light": "#7C3AED",
        "med-gold": "#FFC107",
        "med-gold-dark": "#E6A800",
        "med-black": "#111827",
        "med-red": "#EF4444",
        "med-green": "#22C55E",
        "med-green-dark": "#16A34A",
        "med-red-dark": "#DC2626",
        "med-gray": "#6B7280",
        "med-white": "#F9FAFB",
      },
      boxShadow: {
        "3d": "0px 6px 0px 0px #111827",
        "3d-gold": "0px 6px 0px 0px #92610A",
        "3d-green": "0px 6px 0px 0px #14532D",
        "3d-red": "0px 6px 0px 0px #7F1D1D",
        "3d-purple": "0px 6px 0px 0px #2E1065",
        "3d-gray": "0px 6px 0px 0px #374151",
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
        body: ['"Nunito"', "sans-serif"],
      },
      keyframes: {
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6px)" },
          "40%": { transform: "translateX(6px)" },
          "60%": { transform: "translateX(-4px)" },
          "80%": { transform: "translateX(4px)" },
        },
        "drawer-up": {
          "0%": { transform: "translateY(100%)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        "pop-in": {
          "0%": { transform: "scale(0.5)", opacity: 0 },
          "70%": { transform: "scale(1.1)", opacity: 1 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        "victory-pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "33%": { transform: "translateY(-12px) rotate(3deg)" },
          "66%": { transform: "translateY(-6px) rotate(-2deg)" },
        },
        "star-spin": {
          "0%": { transform: "rotate(0deg) scale(1)" },
          "50%": { transform: "rotate(180deg) scale(1.2)" },
          "100%": { transform: "rotate(360deg) scale(1)" },
        },
        "xp-flash": {
          "0%": { opacity: 1, transform: "translateY(0) scale(1)" },
          "100%": { opacity: 0, transform: "translateY(-40px) scale(1.4)" },
        },
        "fill-bar": {
          "0%": { width: "0%" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(-20px) rotate(0deg)", opacity: 1 },
          "100%": { transform: "translateY(100vh) rotate(720deg)", opacity: 0 },
        },
        "heart-break": {
          "0%": { transform: "scale(1)" },
          "30%": { transform: "scale(1.3)" },
          "60%": { transform: "scale(0.6) rotate(-10deg)" },
          "100%": { transform: "scale(0.8) rotate(0deg)", opacity: 0.3 },
        },
      },
      animation: {
        "bounce-slow": "bounce-slow 1.4s ease-in-out infinite",
        "shake": "shake 0.4s ease-in-out",
        "drawer-up": "drawer-up 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "pop-in": "pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards",
        "victory-pulse": "victory-pulse 1.8s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "star-spin": "star-spin 2s linear infinite",
        "xp-flash": "xp-flash 0.9s ease-out forwards",
        "fill-bar": "fill-bar 0.6s ease-out",
        "confetti-fall": "confetti-fall linear forwards",
        "heart-break": "heart-break 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
