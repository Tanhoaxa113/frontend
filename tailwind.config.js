// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Rất quan trọng: Đảm bảo đường dẫn này đúng
    "./public/index.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}