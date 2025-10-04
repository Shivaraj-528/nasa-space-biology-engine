/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        space: {
          dark: '#0b1020',
          deep: '#0d1b2a',
          blue: '#1b3b6f',
          accent: '#2b6cb0',
          neon: '#00d1ff',
          light: '#a8dadc'
        }
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 209, 255, 0.3)',
      }
    }
  },
  plugins: [],
};
