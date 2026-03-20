/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Globe / dark background (unchanged)
        navy: {
          900: '#0a0f1e',
          800: '#0d1426',
          700: '#111a30',
          600: '#1a2540',
        },
        // Broadsheet panel palette
        newsprint: {
          100: '#f8f5ef',  // panel background (warm cream)
          200: '#f0ece4',  // panel header (slightly darker cream)
          300: '#e8e4dc',  // skeleton / hover bg
          400: '#ddd8cf',  // dividers / hairline rules
        },
        ink: {
          DEFAULT: '#1a1a1a',   // primary text
          light:   '#555555',   // secondary text
          muted:   '#888888',   // tertiary / meta
          faint:   '#aaaaaa',   // attribution
        },
        broadred: {
          DEFAULT: '#b5271f',   // Economist red — labels, links, accents
          dark:    '#8a1810',   // hover state
        },
        // Legacy amber (globe glow — keep these for GlobeView)
        amber: {
          story:     '#c97b2e',
          highlight: '#e8943a',
          hot:       '#d94f2a',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"Source Sans 3"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
