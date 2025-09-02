/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
   extend: {
      fontFamily: {
        malvie: ['Malvie', 'sans-serif'],
        gotham: ['Gotham', 'sans-serif'], // added Gotham
      },
    },
  },
  plugins: [],
}
