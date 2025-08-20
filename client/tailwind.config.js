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
        accentDark: '#16A34A', // Green 600
        danger: '#EF4444', // Red 500
        dangerDark: '#C62828', // Red 600
        light: '#F8FAFC', // Slate 50
        dark: '#1E293B', // Slate 800
      },
    },
  },
  plugins: [],
}
