import { join } from "path";
import { initLog } from "./log_util";
import { app, protocol, BrowserWindow } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import installExtension, { VUEJS3_DEVTOOLS } from "electron-devtools-installer";
import { autoUpdater } from "electron-updater";
import { initialize_valorant_api } from "@/main/valorant";
import { runRiotClient } from "@/main/windows_util";
const isDevelopment = process.env.NODE_ENV !== "production";

initLog();
runRiotClient();

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

let win: BrowserWindow;
async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration:
        true || (process.env.ELECTRON_NODE_INTEGRATION as unknown as boolean),
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      preload: join(__dirname, "/preload.js"),
      nodeIntegrationInWorker: true,
    },
  });

  const filter = {
    urls: [
      "https://auth.riotgames.com/*",
      "https://127.0.0.1:*/*",
      "https://*.a.pvp.net/*",
    ],
  };

  //CORS Bypass
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

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
    autoUpdater.checkForUpdatesAndNotify();
  }
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
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
  initialize_valorant_api(win);
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
