/** @type {import('tailwindcss').Config} */
import plugin from 'tailwindcss/plugin';

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
        'neon-purple': '#b026ff', // premium neon purple
        'pure-black': '#000000',
        'dark-gray': '#111111',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [
    plugin(function({ addVariant }) {
      addVariant('landscape', '@media (orientation: landscape)');
      addVariant('portrait', '@media (orientation: portrait)');
    }),
  ],
}
