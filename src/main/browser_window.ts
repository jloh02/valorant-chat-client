import { join } from "path";
import { BrowserWindow } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import { get_preference } from "./preferences";

let parentWindow: BrowserWindow;

export function createWindow(isPopup: boolean, prefFound?: boolean) {
  //Default parameters for updater window
  let width = 500;
  let height = 150;
  let x: number | undefined;
  let y: number | undefined;

  //Parameters for main renderer window
  if (!isPopup) {
    //Use 1200x800 window if no preferences file found
    width = (get_preference("_winWidth") as number | undefined) || 1200;
    height = (get_preference("_winHeight") as number | undefined) || 800;
    if (prefFound) {
      x = get_preference("_winX") as number | undefined;
      y = get_preference("_winY") as number | undefined;
    }
  }
  let winVar = new BrowserWindow({
    x: x,
    y: y,
    width: width,
    height: height,
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
