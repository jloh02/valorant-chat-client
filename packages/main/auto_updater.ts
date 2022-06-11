import log from "electron-log";
import { BrowserWindow, ipcMain } from "electron";
import {
  autoUpdater,
  UpdateInfo,
  ProgressInfo,
  CancellationToken,
} from "electron-updater";

autoUpdater.autoDownload = false;
autoUpdater.allowPrerelease = true;
autoUpdater.allowDowngrade = false;
autoUpdater.logger = log;

autoUpdater.on("update-available", (info: UpdateInfo) => {
  log.info("[UPDATER] Update available for version:", info.version);
  initializeUpdateListeners();
  win.webContents.send("UPDATE", "SHOW");
});

let win: BrowserWindow;

export function checkForUpdates(mainWin: BrowserWindow) {
  win = mainWin;
  let cancellationToken = new CancellationToken();
  ipcMain.on("UPDATE", (event, cmd) => {
    switch (cmd) {
      case "UPDATE":
        log.info("[UPDATER] Downloading update");
        autoUpdater.downloadUpdate(cancellationToken);
        break;
      case "CANCEL":
        log.info("[UPDATER] Update cancelled");
        ipcMain.removeAllListeners("UPDATER");
        autoUpdater.removeAllListeners("update-downloaded");
        cancellationToken.cancel();
        break;
      default:
        log.warn("[UPDATER] Invalid update command: " + cmd);
    }
  });

  autoUpdater.checkForUpdates();
}

export function testUpdater(mainWin: BrowserWindow) {
  win = mainWin;
  let cancelled = false;
  autoUpdater.emit("update-available", {
    version: "9999.9999.9999",
  });

  ipcMain.on("UPDATE", (event, cmd) => {
    switch (cmd) {
      case "UPDATE":
        log.info("[UPDATER] Downloading update");
        for (let i = 0; i < 100; i++) {
          setTimeout(() => {
            if (cancelled) return;
            autoUpdater.emit("download-progress", {
              bytesPerSecond: 10000,
              percent: i / 100,
              total: 1000000,
              transferred: i*10000,
            });
          }, (i + 1) * 1000);
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
        cancelled = true;
        break;
      default:
        log.warn("[UPDATER] Invalid update command: " + cmd);
    }
  });
}

function initializeUpdateListeners() {
  autoUpdater.on("error", (error: Error) => {
    log.warn(
      "[UPDATER] Update error:",
      error == null ? "unknown" : (error.stack || error).toString()
    );
  });

  autoUpdater.on("download-progress", (progress: ProgressInfo) => {
    log.info(
      `[UPDATER] Update progress: ${progress.transferred}/${progress.total}`
    );
    win.webContents.send(
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
