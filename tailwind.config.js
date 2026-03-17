/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Editorial dark palette
        navy: {
          900: '#0a0f1e',
          800: '#0d1426',
          700: '#111a30',
          600: '#1a2540',
        },
        amber: {
          story: '#c97b2e',
          highlight: '#e8943a',
          hot: '#d94f2a',
        },
      },
    },
  },
  plugins: [],
}
