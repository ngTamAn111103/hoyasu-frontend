/** @type {import('tailwindcss').Config} */
const { COLORS } = require('./constant/color');

module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ...COLORS,
      },
    },
  },
  plugins: [],
};
