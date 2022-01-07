module.exports = {
  mode: "jit",
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  content: ["./src/*.html", "./src/**/*.tsx"],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
};
