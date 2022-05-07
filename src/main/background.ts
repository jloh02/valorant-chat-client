import log from "electron-log";
import { initLog } from "./log_util";
import {
  app,
  protocol,
  ipcMain,
  globalShortcut,
  BrowserWindow,
  Tray,
  Rectangle,
} from "electron";
import { createWindow } from "./browser_window";
import { checkForUpdates, testUpdater } from "./auto_update";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
import { initialize_valorant_api } from "@/main/valorant";
import { runRiotClient } from "@/main/windows_util";
import { closeNotifications, showNotification } from "./notifications";
import { initialize_tray } from "./tray";
import {
  initialize_preferences,
  get_preference,
  set_preference,
} from "./preferences";
const isDevelopment = process.env.NODE_ENV !== "production";

//Ensure single app instance
const lockRetrieved = app.requestSingleInstanceLock();
if (!lockRetrieved) app.exit(0);
initLog();
log.info("[Background] Lock Retrieved and log initialized");

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

let win: BrowserWindow, tray: Tray;

function createMainRendererWindow(prefFound: boolean) {
  win = createWindow(false, prefFound);
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

  win.on("move", save_window_preferences);
  win.on("resize", save_window_preferences);

  //Setup listeners to control window
  ipcMain.on("WINDOW", (event, command, a, b) => {
    switch (command) {
      case "CLOSE":
        get_preference("minimizeToTray") ? win.hide() : win.close();
        break;
      case "MINMAX":
        win.isMaximized() ? win.unmaximize() : win.maximize();
        break;
      case "MINIMIZE":
        win.minimize();
        break;
      case "NOTIFY":
        if (get_preference("notifications")) {
          const focused = win.isFocused();
          if (!focused) win.flashFrame(true);
          showNotification(a, b, focused);
        }
        break;
      case "OPEN_RIOT_CLIENT":
        runRiotClient();
        break;
    }
  });
}

function save_window_preferences() {
  const bounds = win.getNormalBounds();
  set_preference("_winWidth", bounds.width);
  set_preference("_winHeight", bounds.height);
  set_preference("_winX", bounds.x);
  set_preference("_winY", bounds.y);
}

app.on(
  "certificate-error",
  (event, webContents, url, error, certificate, callback) => {
    // On certificate error we disable default behaviour (stop loading the page)
    // and we then say "it is all fine - true" to the callback
    event.preventDefault();
    callback(true);
  }
);

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0)
    createMainRendererWindow(true);
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (process.platform === "win32") app.setAppUserModelId(app.name);

  runRiotClient();
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", JSON.stringify(e));
    }
  }
  const prefFound = initialize_preferences(app);
  createMainRendererWindow(prefFound);
  if (!prefFound) save_window_preferences();
  log.info("[Background] Main window created");
  initialize_tray(app, win, tray);
  log.info("[Background] Tray initialized");
  initialize_valorant_api(win);
  log.info("[Background] VALORANT API initialized");

  if (!isDevelopment) checkForUpdates();
  // else testUpdater();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
