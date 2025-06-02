/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9d55fc', // morado
        secondary: '#7d43c9', // Slate 800
        accent: '#22C55E', // Green 500
        danger: '#EF4444', // Red 500
        light: '#F8FAFC', // Slate 50
      },
    },
  },
  plugins: [],
}
