
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'platea-bg': '#F3F4F6',
        'platea-surface': '#FFFFFFFF',
        'platea-text': '#1E293B',
        'platea-primary': '#7C3AED',
        'platea-accent': '#F97316',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

