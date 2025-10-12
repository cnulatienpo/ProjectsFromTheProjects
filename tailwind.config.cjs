/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1f2937',
          accent: '#2563eb',
          soft: '#f9fafb'
        }
      },
      fontFamily: {
        display: ['"Work Sans"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
