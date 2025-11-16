/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primaryDeepNavy: "#002B5C",
        primaryCobalt: "#004C97",
        accentGold: "#FFC72C",
        accentAmber: "#F5A300",
        neutralBg: "#F5F7FA",
        neutralCard: "#FFFFFF",
        ink: "#0F172A",
        textSecondary: "#64748B",
        textMuted: "#94A3B8",
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        border: "#E2E8F0",
      },
      borderRadius: {
        custom: "8px",
        "custom-lg": "12px",
      },
      boxShadow: {
        custom: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "custom-md":
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        "custom-lg":
          "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [],
};
