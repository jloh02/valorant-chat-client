module.exports = {
  purge: ["./public/**/*.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: false, // or 'media' or 'class'
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      maxWidth: {
        "1/2": "50%",
      },
    },
  },
  variants: {
    extend: {
      fontSize: ["hover"],
      lineHeight: ["hover"],
    },
  },
  plugins: [],
};
