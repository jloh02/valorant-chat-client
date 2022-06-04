import { app, BrowserWindow, Tray } from "electron";
import log from "electron-log";
import { initLog } from "./log_util";
import { release } from "os";
import { checkForUpdates, testUpdater } from "./auto_updater";
import { createMainRendererWindow } from "./browser_window";
import { readPreferences, saveWindowPreferences } from "./preferences";
import { startRiotClient } from "./windows";
import { createTray } from "./tray";
import { initializeValorantApi } from "./valorant";

// Disable GPU Acceleration for Windows 7
if (release().startsWith("6.1")) app.disableHardwareAcceleration();

// Set application name for Windows 10+ notifications
if (process.platform === "win32") app.setAppUserModelId("VALORANT Chat Client");

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

initLog();
log.info("[Background] Lock Retrieved and log initialized");

let win: BrowserWindow, tray: Tray;

app.on(
  "certificate-error",
  (event, webContents, url, error, certificate, callback) => {
    event.preventDefault();
    callback(true);
  }
);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on("activate", () => {
  const allWindows = BrowserWindow.getAllWindows();
  if (allWindows.length) allWindows[0].focus();
  else win = createMainRendererWindow(app.isPackaged, true);
});

app.whenReady().then(() => {
  startRiotClient();

  const prefFound = readPreferences(app);
  win = createMainRendererWindow(app.isPackaged, prefFound);
  if (!prefFound) saveWindowPreferences(win);
  log.info("[Background] Main window created");
  createTray(app, win, tray);
  log.info("[Background] Tray created");
  initializeValorantApi(win);
  log.info("[Background] VALORANT API initialized");

  if (app.isPackaged) checkForUpdates(prefFound);
  // else testUpdater(prefFound);
});

if (!app.isPackaged) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") app.quit();
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
