import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "var(--color-page)",
        panel: "var(--color-panel)",
        control: "var(--color-control)",
        success: "var(--color-success)",
        error: "var(--color-error)",
        ink: {
          DEFAULT: "var(--color-ink)",
          muted: "var(--color-ink-muted)",
          inverse: "var(--color-ink-inverse)",
          onDark: "var(--color-ink-on-dark)",
          button: "var(--color-button-ink)",
        },
        line: {
          DEFAULT: "var(--color-line)",
          success: "var(--color-line-success)",
          error: "var(--color-line-error)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
        },
        danger: "var(--color-danger)",
        ember: "var(--color-ember)",
      },
      fontFamily: {
        body: ["var(--font-body)"],
        display: ["var(--font-display)"],
      },
      boxShadow: {
        focus: "var(--shadow-focus)",
        panel: "var(--shadow-panel)",
      },
      maxWidth: {
        page: "960px",
      },
      minHeight: {
        control: "42px",
      },
      width: {
        rating: "42px",
      },
      height: {
        rating: "42px",
      },
    },
  },
  plugins: [],
};

export default config;
