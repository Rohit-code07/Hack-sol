/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        forest: "#14532D",
        primary: "#16A34A",
        mint: "#DCFCE7",
        canvas: "#F8FAFC",
        ink: "#1E293B",
        warning: "#F59E0B",
      },
      borderRadius: {
        card: "16px",
        button: "10px",
      },
      boxShadow: {
        soft: "0 1px 3px 0 rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.06)",
        elevated: "0 10px 25px -5px rgb(15 23 42 / 0.10), 0 8px 10px -6px rgb(15 23 42 / 0.08)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};