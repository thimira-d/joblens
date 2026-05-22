import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sora: ["Sora", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        primary: {
          dark: "#0A2540",
          blue: "#0A66C2",
          accent: "#2F80ED",
        },
        bg: {
          main: "#F8FAFC",
          card: "#FFFFFF",
        },
        text: {
          main: "#111827",
          secondary: "#6B7280",
        },
        border: "#E5E7EB",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(90deg, #0A66C2, #2F80ED)",
      },
    },
  },
  plugins: [],
};
export default config;
