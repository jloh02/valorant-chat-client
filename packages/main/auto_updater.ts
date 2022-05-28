import log from "electron-log";
import { BrowserWindow, ipcMain } from "electron";
import { autoUpdater, UpdateInfo, ProgressInfo } from "electron-updater";
import { createWindow } from "./browser_window";

autoUpdater.autoDownload = false;
autoUpdater.allowPrerelease = true;
autoUpdater.allowDowngrade = false;
autoUpdater.logger = log;

let updaterWin: BrowserWindow;

autoUpdater.on("update-available", (info: UpdateInfo) => {
  log.info("[UPDATER] Update available for version:", info.version);
  updaterWin = createWindow(true, true);
  initializeUpdateListeners();
});

export function checkForUpdates() {
  ipcMain.on("UPDATE", (event, cmd) => {
    switch (cmd) {
      case "UPDATE":
        log.info("[UPDATER] Downloading update");
        autoUpdater.downloadUpdate();
        break;
      case "CANCEL":
        log.info("[UPDATER] Update cancelled");
        ipcMain.removeAllListeners("UPDATER");
        autoUpdater.removeAllListeners("update-downloaded");
        updaterWin.close();
        break;
      default:
        log.warn("[UPDATER] Invalid update command: " + cmd);
    }
  });

  autoUpdater.checkForUpdates();
}

export function testUpdater() {
  autoUpdater.emit("update-available", {
    version: "9999.9999.9999",
  });

  ipcMain.on("UPDATE", (event, cmd) => {
    switch (cmd) {
      case "UPDATE":
        log.info("[UPDATER] Downloading update");
        let i = 0;
        for (; i < 100; i++) {
          const j = i;
          setTimeout(() => {
            autoUpdater.emit("download-progress", {
              bytesPerSecond: 1,
              percent: j / 100,
              total: 100,
              transferred: j,
            });
          }, (j + 1) * 1000);
        }

        setTimeout(() => {
          autoUpdater.emit("update-downloaded", {
            version: "9999.9999.9999",
          });
        }, 100000);
        break;
      case "CANCEL":
        log.info("[UPDATER] Update cancelled");
        ipcMain.removeAllListeners("UPDATER");
        autoUpdater.removeAllListeners("update-downloaded");
        updaterWin.close();
        break;
      default:
        log.warn("[UPDATER] Invalid update command: " + cmd);
    }
  });
}

function initializeUpdateListeners() {
  autoUpdater.on("error", (error: Error) => {
    if (updaterWin) updaterWin.close();
    log.warn(
      "[UPDATER] Update error:",
      error == null ? "unknown" : (error.stack || error).toString()
    );
  });

  autoUpdater.on("download-progress", (progress: ProgressInfo) => {
    log.info(
      `[UPDATER] Update progress: ${progress.transferred}/${progress.total}`
    );
    updaterWin.webContents.send(
      "UPDATE",
      "PROGRESS",
      progress.transferred,
      progress.total
    );
  });

  autoUpdater.on("update-not-available", () =>
    log.info("[UPDATER] No updates available")
  );

  //Automatically close application and install upon update completion
  autoUpdater.on("update-downloaded", (info) => {
    log.info("[UPDATER] Update downloaded (", info.version, ")");
    setImmediate(() => {
      autoUpdater.quitAndInstall();
    });
  });
}
