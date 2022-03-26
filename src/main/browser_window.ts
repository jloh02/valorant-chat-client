import { join } from "path";
import { BrowserWindow } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";

let parentWindow: BrowserWindow;

export function createWindow(isPopup: boolean) {
  // Create the browser window.
  let winVar = new BrowserWindow({
    width: isPopup ? 500 : 1200,
    height: isPopup ? 150 : 800,
    minWidth: 600,
    minHeight: 400,
    frame: false,
    resizable: !isPopup,
    modal: isPopup,
    parent: isPopup ? parentWindow : undefined,
    backgroundColor: "#292524",
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env
        .ELECTRON_NODE_INTEGRATION as unknown as boolean,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: join(__dirname, isPopup ? "updaterPreload.js" : "preload.js"),
      devTools: isPopup
        ? false
        : process.env.WEBPACK_DEV_SERVER_URL != undefined,
    },
  });

  if (!isPopup) parentWindow = winVar;

  winVar.once("ready-to-show", () => winVar.show());

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    winVar.loadURL(
      (process.env.WEBPACK_DEV_SERVER_URL as string) +
        (isPopup ? "#/updater/" : "")
    );
    if (!process.env.IS_TEST) winVar.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    winVar.loadURL(
      "app://./" + (isPopup ? "index.html#updater" : "index.html")
    );
    winVar.removeMenu();
  }

  return winVar;
}
