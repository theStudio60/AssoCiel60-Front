/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(211, 85%, 33%)',
          light: 'hsl(211, 85%, 45%)',
          foreground: 'hsl(0, 0%, 100%)',
        },
      },
    },
  },
  plugins: [],
}