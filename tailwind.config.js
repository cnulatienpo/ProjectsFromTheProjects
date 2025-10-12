/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "brand-soft": "#e0f2fe" /* light blue; change if you want */
      }
    }
  },
  plugins: []
};
