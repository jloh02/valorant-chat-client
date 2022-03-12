module.exports = {
  configureWebpack: {
    resolve: {
      fallback: {
        fs: require.resolve("fs"),
        os: require.resolve("os-browserify/browser"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        path: require.resolve("path-browserify"),
      },
    },
  },
  pluginOptions: {
    electronBuilder: {
      chainWebpackMainProcess: (config) => {
        config.target("electron-main");
      },
      preload: "src/renderer/preload.js",
      mainProcessFile: "src/main/background.ts",
      rendererProcessFile: "src/renderer/main.ts",
      mainProcessWatch: ["src/main/*"],
    },
  },
};
