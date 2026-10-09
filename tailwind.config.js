// Same brand colors as the app (tpf-app/tailwind.config.js).
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          DEFAULT: '#0ea5e9',
          dark: '#0369a1',
        },
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,.06)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
}
