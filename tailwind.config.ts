import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0A0F",
          50: "#F4F4F8",
          100: "#0A0A0F",
          200: "#12121A",
          300: "#1A1A24",
          400: "#22222E",
          500: "#2D2D3A",
        },
        cyan: {
          glow: "#00E5FF",
        },
        violet: {
          glow: "#8B5CF6",
        },
        emerald: {
          glow: "#10B981",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-12px) scale(1.02)" },
        },
        glow: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        gridmove: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "64px 64px" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.85)", opacity: "0.6" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        marquee: "marquee 28s linear infinite",
        "orbit-slow": "orbit 30s linear infinite",
        "orbit-reverse": "orbit 42s linear infinite reverse",
        float: "float 6s ease-in-out infinite",
        glow: "glow 3s ease-in-out infinite",
        "grid-move": "gridmove 18s linear infinite",
        "pulse-ring": "pulseRing 3.5s cubic-bezier(0.16, 1, 0.3, 1) infinite",
      },
      backgroundImage: {
        "gradient-radial":
          "radial-gradient(circle at center, var(--tw-gradient-stops))",
        "grid-glow":
          "linear-gradient(to right, rgba(0,229,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,229,255,0.06) 1px, transparent 1px)",
      },
      boxShadow: {
        "glow-cyan": "0 0 32px rgba(0,229,255,0.35)",
        "glow-violet": "0 0 32px rgba(139,92,246,0.35)",
        "glow-emerald": "0 0 32px rgba(16,185,129,0.35)",
        "glow-amber": "0 0 32px rgba(245,158,11,0.35)",
        "card":
          "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 0 0 1px rgba(255,255,255,0.06), 0 12px 32px -8px rgba(0,0,0,0.5)",
      },
      typography: ({ theme }: { theme: (path: string) => string }) => ({
        invert: {
          css: {
            "--tw-prose-body": theme("colors.zinc.300"),
            "--tw-prose-headings": theme("colors.white"),
            "--tw-prose-lead": theme("colors.zinc.300"),
            "--tw-prose-links": theme("colors.cyan.glow"),
            "--tw-prose-bold": theme("colors.white"),
            "--tw-prose-counters": theme("colors.cyan.glow"),
            "--tw-prose-bullets": theme("colors.violet.glow"),
            "--tw-prose-hr": "rgba(255,255,255,0.08)",
            "--tw-prose-quotes": theme("colors.white"),
            "--tw-prose-quote-borders": theme("colors.violet.glow"),
            "--tw-prose-captions": theme("colors.zinc.500"),
            "--tw-prose-code": theme("colors.cyan.glow"),
            "--tw-prose-pre-code": theme("colors.zinc.200"),
            "--tw-prose-pre-bg": "rgba(0,0,0,0.55)",
            "--tw-prose-th-borders": "rgba(255,255,255,0.1)",
            "--tw-prose-td-borders": "rgba(255,255,255,0.06)",

            maxWidth: "none",

            h2: {
              fontWeight: "700",
              letterSpacing: "-0.01em",
              marginTop: "2.5em",
              marginBottom: "0.9em",
              paddingBottom: "0.5em",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              position: "relative",
            },
            "h2:first-child": {
              marginTop: "0",
            },
            "h2::before": {
              content: '""',
              display: "inline-block",
              width: "0.5em",
              height: "1em",
              marginRight: "0.5em",
              verticalAlign: "-0.15em",
              borderRadius: "2px",
              background:
                "linear-gradient(180deg, #00E5FF 0%, #8B5CF6 100%)",
              boxShadow: "0 0 12px rgba(0,229,255,0.5)",
            },
            h3: {
              fontWeight: "600",
              color: theme("colors.cyan.glow"),
              marginTop: "2em",
            },
            p: {
              lineHeight: "1.75",
            },
            strong: {
              fontWeight: "600",
            },
            "ul > li": {
              paddingLeft: "0.3em",
            },
            "ul > li::marker": {
              color: theme("colors.violet.glow"),
            },
            "ol > li::marker": {
              color: theme("colors.cyan.glow"),
              fontWeight: "600",
            },
            a: {
              textDecoration: "none",
              borderBottom: "1px solid rgba(0,229,255,0.35)",
              fontWeight: "500",
              transition: "border-color 0.15s ease, color 0.15s ease",
            },
            "a:hover": {
              borderBottomColor: theme("colors.cyan.glow"),
            },
            code: {
              fontWeight: "500",
              backgroundColor: "rgba(0,229,255,0.08)",
              border: "1px solid rgba(0,229,255,0.2)",
              borderRadius: "0.35rem",
              padding: "0.15em 0.4em",
            },
            "code::before": { content: "none" },
            "code::after": { content: "none" },
            pre: {
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.75rem",
              boxShadow:
                "0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 32px -12px rgba(0,0,0,0.6)",
            },
            "pre code": {
              backgroundColor: "transparent",
              border: "none",
              padding: "0",
              fontWeight: "400",
            },
            blockquote: {
              fontStyle: "normal",
              fontWeight: "500",
              borderLeftWidth: "3px",
              borderLeftColor: theme("colors.violet.glow"),
              backgroundColor: "rgba(139,92,246,0.06)",
              borderRadius: "0 0.5rem 0.5rem 0",
              padding: "0.75em 1.25em",
            },
            "blockquote p:first-of-type::before": { content: "none" },
            "blockquote p:last-of-type::after": { content: "none" },
            table: {
              width: "100%",
              overflow: "hidden",
              borderRadius: "0.5rem",
            },
            thead: {
              backgroundColor: "rgba(0,229,255,0.08)",
            },
            "thead th": {
              fontWeight: "600",
              color: theme("colors.cyan.glow"),
              textTransform: "uppercase",
              fontSize: "0.75em",
              letterSpacing: "0.05em",
            },
            "tbody tr": {
              borderBottomColor: "rgba(255,255,255,0.06)",
            },
            "tbody tr:hover": {
              backgroundColor: "rgba(255,255,255,0.02)",
            },
            hr: {
              marginTop: "2.5em",
              marginBottom: "2.5em",
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
