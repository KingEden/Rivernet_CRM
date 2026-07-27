/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#1C7DE9', // Rivernet Blue Primary
          605: '#22CDED', // Rivernet Cyan Accent
          600: '#146cd1',
          700: '#0e5cb3',
          800: '#0e3e76',
          900: '#0f2d53',
          950: '#0b1a2d',
        },
        slate: {
          950: '#070a13',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
