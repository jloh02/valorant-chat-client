import { SCREEN_DEFAULTS } from "./../constants";
import { join } from "path";
import { BrowserWindow, Tray, shell, globalShortcut, ipcMain } from "electron";
import log from "electron-log";
import { getPreference, saveWindowPreferences } from "./preferences";
import { startRiotClient } from "./windows";
import { closeNotifications, showNotification } from "./notifications";

let tray: Tray;

export function createWindow(isPackaged: boolean, prefFound?: boolean) {
  let x: number | undefined;
  let y: number | undefined;

  //Use default main window if no preferences file found
  let width = (getPreference("winWidth") ||
    SCREEN_DEFAULTS.mainWidth) as number;
  let height = (getPreference("winHeight") ||
    SCREEN_DEFAULTS.mainHeight) as number;

  //X and Y applies to both updater and main window
  if (prefFound) {
    x = getPreference("winX") as number;
    y = getPreference("winY") as number;
  }
  let winVar = new BrowserWindow({
    x: x,
    y: y,
    width: width,
    height: height,
    minWidth: SCREEN_DEFAULTS.minWidth,
    minHeight: SCREEN_DEFAULTS.minHeight,
    show: false,
    frame: false,
    resizable: true,
    backgroundColor: "#292524",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, "../preload/renderer.cjs"),
      devTools: !isPackaged,
    },
  });

  // Make all links open with the browser, not with the application
  winVar.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("https:")) shell.openExternal(url);
    return { action: "deny" };
  });

  winVar.once("ready-to-show", () => winVar.show());

  if (isPackaged) {
    winVar.loadFile(join(__dirname, "../renderer/index.html"));
    winVar.removeMenu();
  } else {
    // 🚧 Use ['ENV_NAME'] avoid vite:define plugin
    const url = `http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}`;
    winVar.loadURL(url);
    winVar.webContents.openDevTools();
  }

  return winVar;
}

export function createMainRendererWindow(
  isPackaged: boolean,
  prefFound: boolean
) {
  let win = createWindow(isPackaged, prefFound);
  globalShortcut.unregisterAll();

  //CORS Bypass
  const filter = {
    urls: [
      "https://auth.riotgames.com/*",
      "https://127.0.0.1:*/*",
      "https://*.a.pvp.net/*",
    ],
  };
  win.webContents.session.webRequest.onHeadersReceived(
    filter,
    (details, callback) => {
      if (details.responseHeaders) {
        details.responseHeaders["access-control-allow-origin"] = [
          "http://localhost:8080",
        ];
        details.responseHeaders["access-control-allow-methods"] = [
          "GET,PUT,POST,DELETE,OPTIONS",
        ];
        details.responseHeaders["access-control-allow-headers"] = [
          "Content-Type, Authorization, X-Riot-Entitlements-JWT, X-Riot-ClientPlatform",
        ];
      } else {
        details.responseHeaders = {
          "access-control-allow-origin": ["http://localhost:8080"],
          "access-control-allow-methods": ["GET,PUT,POST,DELETE,OPTIONS"],
          "access-control-allow-headers": [
            "Content-Type, Authorization, X-Riot-Entitlements-JWT, X-Riot-ClientPlatform",
          ],
        };
      }
      callback({ responseHeaders: details.responseHeaders });
    }
  );

  win.on("focus", () => {
    win.flashFrame(false);
    closeNotifications();
  });

  win.on("move", () => {
    saveWindowPreferences(win);
  });
  win.on("resize", () => {
    saveWindowPreferences(win);
  });

  //Setup listeners to control window
  ipcMain.on("WINDOW", (event, command, a, b) => {
    switch (command) {
      case "CLOSE":
        getPreference("minimizeToTray") ? win.hide() : win.close();
        break;
      case "MINMAX":
        win.isMaximized() ? win.unmaximize() : win.maximize();
        break;
      case "MINIMIZE":
        win.minimize();
        break;
      case "NOTIFY":
        if (getPreference("notifications")) {
          const focused = win.isFocused();
          if (!focused) win.flashFrame(true);
          showNotification(a, b, focused);
        }
        break;
      case "OPEN_RIOT_CLIENT":
        startRiotClient();
        break;
      default:
        log.warn("[WINDOW] Invalid window control command: " + command);
    }
  });
  return win;
}
