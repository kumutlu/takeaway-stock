import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f4f5f7",
          100: "#e6e9ee",
          200: "#c7ceda",
          300: "#a2adbf",
          400: "#7f8ba3",
          500: "#5e6b82",
          600: "#4a5569",
          700: "#3b4353",
          800: "#2b313d",
          900: "#1d222b"
        },
        sand: {
          50: "#fdfaf5",
          100: "#fbf3e5",
          200: "#f6e6c8",
          300: "#efd5a6",
          400: "#e7c282",
          500: "#d8a85c",
          600: "#bf8a3d",
          700: "#9a6b2b",
          800: "#7a5324",
          900: "#5f3f1f"
        }
      },
      boxShadow: {
        card: "0 20px 60px rgba(15, 23, 42, 0.12)",
        soft: "0 8px 24px rgba(15, 23, 42, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
