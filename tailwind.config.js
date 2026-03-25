/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./store/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        vlogger: {
          red: "#FF0000",
          black: "#0F0F0F",
          dark: "#1A1A1A",
          gray: "#AAAAAA",
          "light-gray": "#E5E5E5",
          white: "#FFFFFF",
          gold: "#FFD700",
          silver: "#C0C0C0",
          bronze: "#CD7F32",
        },
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
};
