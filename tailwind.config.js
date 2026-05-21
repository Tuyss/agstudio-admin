/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        black:    '#060d1a',
        surface:  '#0e1e36',
        surface2: '#132440',
        accent:   '#4d9fff',
        accent2:  '#1a6fd4',
        muted:    '#7a9ac0',
        agtext:   '#e8f0ff',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
