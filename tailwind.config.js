/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./frontend/index.html",
    "./admin/index.html",
    "./frontend/src/**/*.{js,ts,jsx,tsx}",
    "./admin/src/**/*.{js,ts,jsx,tsx}",
    "./shared/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          background: '#F9F8F6', // Off-white textured background
          surface: '#F4F2EE', // Slightly darker for cards
          espresso: '#2B2118', // Deep brown/espresso for text
          charcoal: '#333333', // Secondary text
          accent: '#8C7A6B', // Muted vintage accent
          border: '#E8E5E1'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
