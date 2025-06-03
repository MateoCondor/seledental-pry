/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9d55fc', // Purple 500
        primaryDark: '#7d43c9', // Purple 600
        secondary: '#6455FC', // Indigo 600
        secondaryDark: '#4f43c9', // Indigo 700
        accent: '#22C55E', // Green 500
        danger: '#EF4444', // Red 500
        light: '#F8FAFC', // Slate 50
      },
    },
  },
  plugins: [],
}
