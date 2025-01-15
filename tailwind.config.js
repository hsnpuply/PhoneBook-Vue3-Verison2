/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "./src/**/**/*.{vue,js,ts,jsx,tsx}",

  ],  theme: {
    extend: {
      fontFamily: {
        vazir:['VazirPersian','sans-serif']
      },
      colors: {
        'drawer_primary': '#ebf1ef',
      },
      maxHeight: {
        'calc-100-plus-10': 'calc(100% + 10px)',
      },
    },  },
  plugins: [],
}

