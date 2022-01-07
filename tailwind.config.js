module.exports = {
  mode: "jit",
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: ["./src/*.html", "./src/**/*.tsx"],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
};
