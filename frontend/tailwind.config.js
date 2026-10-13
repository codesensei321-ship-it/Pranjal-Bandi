/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f5f0e8',
        sage: {
          50: '#f0f5f0',
          100: '#dce8dc',
          200: '#b8d4b8',
          300: '#8aba8a',
          400: '#5a9a5a',
          500: '#4a8a4a',
          600: '#3d7a3d',
          700: '#2d5f2d',
          800: '#1e4a1e',
          900: '#1a3a1a',
        },
        plant: {
          dark: '#1a2e1a',
          card: '#1e3a1e',
          surface: '#243824',
        },
        accent: {
          green: '#4ade80',
          emerald: '#34d399',
          lime: '#a3e635',
          purple: '#8b5cf6',
          violet: '#a78bfa',
          deep: '#7c3aed',
        },
        background: {
          dark: '#0f1a0f',
          card: 'rgba(30, 58, 30, 0.5)',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
