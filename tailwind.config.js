/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
        background: '#1F2937',
        secondary: '#F9FAFB',
        disable: '#4B5563',

        // Semantic color names
        primary: {
          background: '#1F2937',
          secondary: '#F9FAFB',
          disable: '#4B5563',
        },
      },
    },
  },
  plugins: [],
}
