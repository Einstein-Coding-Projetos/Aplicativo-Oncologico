/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('nativewind/preset')],
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#0B63F6',
        surface: '#FFFFFF',
        canvas: '#E6EDF9',
        muted: '#23344F',
      },
      borderRadius: {
        xl2: '20px',
      },
      boxShadow: {
        card: '0 8px 24px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};
