/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        foreground: '#0F172A',
        muted: '#64748B',
        primary: '#2563EB',
        surface: '#FFFFFF',
        border: '#E2E8F0',
        danger: '#DC2626',
      },
    },
  },
  plugins: [],
};
