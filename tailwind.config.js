/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
              "primary-container": "#00f2ff",
              "secondary-container": "#7000ff",
              "background": "#050505",
      },
      "fontFamily": {
              "display-xl": ["Inter", "sans-serif"],
              "label-caps": ["Space Grotesk", "sans-serif"],
      }
    },
  },
  plugins: [],
}
