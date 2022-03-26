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
      mainProcessFile: "src/main/background.ts",
      rendererProcessFile: "src/renderer/main.ts",
      preload: {
        preload: "src/renderer/preload.js",
        updaterPreload: "src/renderer/updater-preload.js",
      },
      mainProcessWatch: ["src/main/*", "src/types/*"],
      builderOptions: {
        productName: "VALORANT Chat Client",
        publish: ["github"],
        win: {
          target: ["nsis"],
          icon: "build/icons/icon.png",
        },
        nsis: {
          oneClick: false,
          perMachine: true,
          allowElevation: true,
          allowToChangeInstallationDirectory: true,
          deleteAppDataOnUninstall: true,
        },
        extraResources: [
          {
            from: "node_modules/regedit/vbs",
            to: "regedit/vbs",
            filter: ["**/*"],
          },
        ],
      },
    },
  },
};
