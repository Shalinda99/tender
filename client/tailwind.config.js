/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0a0c12",
          900: "#0f1320",
          800: "#161b2e",
          700: "#1e2540",
        },
        brand: {
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
        },
        tender: {
          lime: "#a3e635",
          gold: "#fbbf24",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
