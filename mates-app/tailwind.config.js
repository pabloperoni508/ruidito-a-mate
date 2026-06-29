/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          white: "#FFFFFF",
          brown: "#6F4E37",
          "brown-dark": "#4A3326",
          "brown-light": "#A9826B",
          green: "#4CAF50",
          yellow: "#F2C12E",
          gray: "#E5E5E5",
          red: "#E0483E",
        },
      },
      fontFamily: {
        sans: [
          "SF Pro Display",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};