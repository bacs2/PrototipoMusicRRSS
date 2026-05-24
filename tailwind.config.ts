import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "surface-container-low": "var(--color-surface-container-low)",
        "surface-container": "var(--color-surface-container)",
        "surface-container-high": "var(--color-surface-container-high)",
        "surface-container-highest": "var(--color-surface-container-highest)",
        primary: "var(--color-primary)",
        "primary-dim": "var(--color-primary-dim)",
        secondary: "var(--color-secondary)",
        "on-surface": "var(--color-on-surface)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        "outline-variant": "var(--color-outline-variant)",
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      fontFamily: {
        headline: ["Epilogue"],
        body: ["Manrope"],
        label: ["Manrope"],
      },
    },
  },
  plugins: [],
};

export default config;
