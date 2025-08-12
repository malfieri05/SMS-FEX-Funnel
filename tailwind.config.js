/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      scale: {
        '125': '1.25',
        '150': '1.5',
      },
    },
  },
  plugins: [],
} 