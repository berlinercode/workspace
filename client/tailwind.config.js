/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aurora: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        space: {
          50: '#0f0f23',
          100: '#1a1a3a',
          200: '#2d2d5a',
          300: '#4a4a7a',
          400: '#6b6b9a',
          500: '#8b8bba',
          600: '#ababda',
          700: '#cbcbfa',
          800: '#e0e0ff',
          900: '#f0f0ff',
        }
      },
      animation: {
        'aurora': 'aurora 8s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        aurora: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        }
      }
    },
  },
  plugins: [],
}