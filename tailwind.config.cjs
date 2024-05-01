/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [
    "prettier-plugin-tailwindcss",
    "@tailwind/typography"
  ]
}

