import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Single-hue brand accent — used at varying alphas across the app.
        "pitch-mint": {
          DEFAULT: "#6ee7b7",
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
      },
      fontFamily: {
        // next/font injects --font-inter via app/layout.tsx
        sans: [
          "var(--font-inter)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      backgroundImage: {
        // Locked Pitch stage gradient. Two flavours:
        //   pitch-stage      — used on the chat (subtle teal halo)
        //   pitch-stage-hero — used on the home page (stronger top wash so the
        //                      ball reads against the dark)
        "pitch-stage": [
          "radial-gradient(ellipse 80% 30% at 50% 0%, rgba(20, 184, 166, 0.18) 0%, transparent 70%)",
          "linear-gradient(180deg, #042f2e 0%, #052e16 25%, #050b0e 70%, #000 100%)",
        ].join(", "),
        "pitch-stage-hero": [
          "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(20, 184, 166, 0.35) 0%, transparent 60%)",
          "radial-gradient(ellipse 60% 40% at 50% 25%, rgba(16, 185, 129, 0.25) 0%, transparent 65%)",
          "linear-gradient(180deg, #042f2e 0%, #052e16 35%, #050b0e 75%, #000 100%)",
        ].join(", "),
      },
      keyframes: {
        // Soccer-ball hero: rotate + bob on a 5s loop.
        ballCombo: {
          "0%": { transform: "translateY(0) rotate(0deg)" },
          "25%": { transform: "translateY(-12px) rotate(90deg)" },
          "50%": { transform: "translateY(0) rotate(180deg)" },
          "75%": { transform: "translateY(-12px) rotate(270deg)" },
          "100%": { transform: "translateY(0) rotate(360deg)" },
        },
        // Mode-toggle slider — used in the preview-loop only.
        // Production transitions are tap-driven (~350ms spring).
        slideLR: {
          "0%, 38%": { transform: "translateX(0)" },
          "50%, 88%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        // 🔥 Hype emoji — blooms upward from the bottom like a flame igniting.
        // transform-origin: bottom center is set on the element.
        hypeBloom: {
          "0%": { transform: "scale(0.5)", opacity: "0.5" },
          "4%": { transform: "scale(1.25)", opacity: "1" },
          "9%": { transform: "scale(0.94)", opacity: "1" },
          "14%": { transform: "scale(1)", opacity: "1" },
          "22%": { transform: "scale(1.03)", opacity: "1" },
          "30%": { transform: "scale(1)", opacity: "1" },
          "36%": { transform: "scale(1.02)", opacity: "1" },
          "38%": { transform: "scale(1)", opacity: "1" },
          "44%": { transform: "scale(0.7)", opacity: "0.7" },
          "50%": { transform: "scale(0.55)", opacity: "0.55" },
          "88%": { transform: "scale(0.55)", opacity: "0.55" },
          "100%": { transform: "scale(0.5)", opacity: "0.5" },
        },
        // 😌 Calm emoji — burst on activation, then a slow breath cycle.
        calmBreath: {
          "0%, 38%": { transform: "scale(0.92) translateY(0)", opacity: "0.75" },
          "44%": { transform: "scale(1) translateY(0)", opacity: "1" },
          "50%": { transform: "scale(1.3) translateY(-3px)" },
          "55%": { transform: "scale(1.05) translateY(-1px)" },
          "65%": { transform: "scale(1.12) translateY(-2px)" },
          "75%": { transform: "scale(1.04) translateY(0)" },
          "85%": { transform: "scale(1.1) translateY(-2px)" },
          "88%": { transform: "scale(1) translateY(0)" },
          "94%": { transform: "scale(0.96) translateY(0)", opacity: "0.85" },
          "100%": { transform: "scale(0.92) translateY(0)", opacity: "0.75" },
        },
        // 3-dot loading indicator.
        typingDot: {
          "0%, 60%, 100%": { transform: "translateY(0)", opacity: "0.4" },
          "30%": { transform: "translateY(-4px)", opacity: "1" },
        },
        // Soccer-ball glow halo + ground shadow.
        glowPulse: {
          "0%, 100%": { opacity: "0.7", transform: "translate(-50%, -50%) scale(1)" },
          "50%": { opacity: "1", transform: "translate(-50%, -50%) scale(1.1)" },
        },
        shadowBreathe: {
          "0%, 100%": { transform: "translateX(-50%) scaleX(1)", opacity: "0.9" },
          "50%": { transform: "translateX(-50%) scaleX(0.78)", opacity: "0.6" },
        },
        // Smart-pick chip — animated mint-gradient border + glow halo.
        borderShift: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        smartGlow: {
          "0%, 100%": { opacity: "0.4", transform: "scale(0.95)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        // Coach-status pulse dot.
        statusPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        // Analyze stage 3 — concentric rings around the spinning ball.
        s3RingPulse: {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.95)" },
          "50%": { opacity: "0.8", transform: "scale(1.02)" },
        },
        // Analyze stage 3 — soft mint glow halo behind the spinner.
        s3GlowPulse: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        // Analyze stage 3 — soccer ball spins (separate from ballCombo so
        // the bob-and-roll on the hero doesn't fight with the steady spin).
        s3Spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "ball-combo": "ballCombo 5s ease-in-out infinite",
        "slide-lr": "slideLR 6s ease-in-out infinite",
        "hype-bloom": "hypeBloom 6s ease-in-out infinite",
        "calm-breath": "calmBreath 6s ease-in-out infinite",
        "typing-dot": "typingDot 1.2s infinite",
        "glow-pulse": "glowPulse 3s ease-in-out infinite",
        "shadow-breathe": "shadowBreathe 2s ease-in-out infinite",
        "border-shift": "borderShift 3.5s linear infinite",
        "smart-glow": "smartGlow 2.6s ease-in-out infinite",
        "status-pulse": "statusPulse 2s ease-in-out infinite",
        "s3-ring-pulse": "s3RingPulse 2s ease-in-out infinite",
        "s3-ring-pulse-delayed": "s3RingPulse 2s ease-in-out 0.5s infinite",
        "s3-glow-pulse": "s3GlowPulse 3s ease-in-out infinite",
        "s3-spin": "s3Spin 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
