export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#e40000',
          50:  '#fff0f0',
          100: '#ffdcdc',
          200: '#ffb3b3',
          500: '#e40000',
          600: '#cc0000',
          700: '#a30000',
        },
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.08)',
        nav:  '0 2px 4px rgba(0,0,0,0.08)',
      },
      keyframes: {
        'slide-in': {
          '0%':   { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.2s ease-out forwards',
      },
    },
  },
  plugins: [],
}
