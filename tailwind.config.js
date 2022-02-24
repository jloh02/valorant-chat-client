module.exports = {
  content: ["./public/**/*.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  darkMode: "media",
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
