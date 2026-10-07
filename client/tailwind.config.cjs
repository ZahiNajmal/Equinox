  // client/tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"   // This line is critical
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4d9de0",
        accent1: "#e15554",
        accent2: "#e1bc29",
        accent3: "#3bb273",
        accent4: "#7768ae",
      },
    },
  },
  plugins: [],
}