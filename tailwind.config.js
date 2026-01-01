/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🌿 Greens
        "primary-green": "#236F21",   // Primary green
        "secondary-green": "#ebffdfff",      // Deep leaf green
        "txt-clr": "#112002ff",       // Background
       
      },
    },
  },
  plugins: [],
}
