/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // We will force dark mode
  theme: {
    extend: {
      colors: {
        'neon-green': '#39ff14',
        'neon-red': '#ff073a',
        'neon-yellow': '#eiff00', // high visibility yellow
        'pure-black': '#000000',
        'dark-gray': '#111111',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
