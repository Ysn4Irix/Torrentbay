/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#05070C',
        foreground: '#F8FAFC',
        muted: '#A8B3C2',
        primary: '#8B3DFF',
        primarySoft: '#A855F7',
        surface: '#101720',
        surfaceElevated: '#151E29',
        border: '#223040',
        danger: '#F97366',
        seeders: '#4ADE80',
        leechers: '#F97366',
      },
    },
  },
  plugins: [],
};
