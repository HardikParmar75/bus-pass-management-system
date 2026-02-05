/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#192a4d",
        "background-light": "#f0f2f4",
        "background-dark": "#17191c",
      },
      fontFamily: {
        display: ["Public Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
}
