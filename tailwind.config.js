/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        night: "#101729",
        ink: "#051546",
        fifaBlue: "#071A8C",
        fifaPurple: "#452BFF",
        neonBlue: "#00C6FF",
        paper: "#FFF7E6",
        cream: "#051546",
        green: "#14B86A",
        gold: "#FFB703",
        sun: "#FFD966",
        red: "#E63946",
        coral: "#F25F4C",
        sky: "#2A9DF4",
        ocean: "#006D77",
      },
      boxShadow: {
        glow: "0 24px 80px rgba(20, 33, 61, 0.16)",
      },
    },
  },
  plugins: [],
};
