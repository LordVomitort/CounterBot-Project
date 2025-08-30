/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        "input-group": {
          DEFAULT: "#1d3011",
          light: "#283d1a",
          border: "#414a3b"
        },

        "panel": {
          darkest: "#0f1324",
          border: "#252938",
          primary: "#0c1333",
          secundary: "#171e3b"
        }

      }
    },
    
  },
  plugins: [],
}

