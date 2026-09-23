/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF6F0',
          100: '#FFE8DC',
          200: '#FFD1BA',
          300: '#FFB38D',
          400: '#FF8452',
          DEFAULT: '#FA4B00',
          500: '#FA4B00',
          600: '#DE4000',
          700: '#B83200',
          800: '#942600',
          900: '#7A1F00',
        },
        dark: {
          950: '#090A0C',
          900: '#0F1115',
          800: '#181A20',
          700: '#232730',
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      maxWidth: {
        '8xl': '88rem',
      },
      boxShadow: {
        'subtle': '0 2px 12px -2px rgba(0, 0, 0, 0.05)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.06)',
        'orange-glow': '0 10px 25px -5px rgba(250, 75, 0, 0.25)',
      }
    },
  },
  plugins: [],
}
