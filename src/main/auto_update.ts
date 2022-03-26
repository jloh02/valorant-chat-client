import log from "electron-log";
import { BrowserWindow, ipcMain } from "electron";
import { autoUpdater, UpdateInfo } from "electron-updater";
import { createWindow } from "./browser_window";

autoUpdater.autoDownload = false;
autoUpdater.allowPrerelease = true;
autoUpdater.allowDowngrade = false;
autoUpdater.logger = log;

let updaterWin: BrowserWindow;

autoUpdater.on("update-available", (info: UpdateInfo) => {
  log.info("Update available for version:", info.version);
  updaterWin = createWindow(true);
  initializeUpdateListeners();
});

export function checkForUpdates() {
  ipcMain.on("UPDATE", (event, cmd) => {
    switch (cmd) {
      case "UPDATE":
        log.info("Downloading Update");
        autoUpdater.downloadUpdate();
        break;
      case "CANCEL":
        ipcMain.removeAllListeners("UPDATER");
        autoUpdater.removeAllListeners("update-downloaded");
        updaterWin.close();
        break;
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
        log.info("Downloading Update");
        let i = 0;
        for (; i < 100; i++) {
          const j = i;
          setTimeout(() => {
            autoUpdater.emit("download-progress", {}, 1, j / 100, 100, j);
          }, (j + 1) * 1000);
        }

        setTimeout(() => {
          autoUpdater.emit("update-downloaded", {
            version: "9999.9999.9999",
          });
        }, 100000);
        break;
      case "CANCEL":
        ipcMain.removeAllListeners("UPDATER");
        autoUpdater.removeAllListeners("update-downloaded");
        updaterWin.close();
        break;
    }
  });
}

function initializeUpdateListeners() {
  autoUpdater.on("error", (error: Error) => {
    if (updaterWin) updaterWin.close();
    log.warn(
      "Update error:",
      error == null ? "unknown" : (error.stack || error).toString()
    );
  });

  autoUpdater.on(
    "download-progress",
    (progress, bytesPerSecond, percent, total, transferred) =>
      updaterWin.webContents.send("UPDATE", "PROGRESS", transferred, total)
  );

  autoUpdater.on("update-not-available", () =>
    log.info("No updates available")
  );

  //Automatically close application and install upon update completion
  autoUpdater.on("update-downloaded", (info) => {
    log.info("Update downloaded (", info.version, ")");
    setImmediate(() => autoUpdater.quitAndInstall());
  });
}
