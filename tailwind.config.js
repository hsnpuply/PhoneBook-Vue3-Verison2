/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./src/**/**/*.{vue,js,ts,jsx,tsx}",

  ],  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'], // Override default sans
        vazir:['VazirPersian','sans-serif']
      },
      colors: {
        'drawer_primary': '#ebf1ef',
      }
    },  },
  plugins: [],
}

