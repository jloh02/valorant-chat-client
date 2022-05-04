import { App, BrowserWindow, Menu, Tray } from "electron";

export function initialize_tray(app: App, win: BrowserWindow, tray: Tray) {
  tray = new Tray("build/icons/icon.png");
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Chat",
      click: function () {
        win.show();
      },
    },
    {
      label: "Quit",
      click: function () {
        win.close();
        app.quit();
      },
    },
  ]);
  tray.on("click", function () {
    win.show();
  });
  tray.setToolTip("VALORANT Chat Client");
  tray.setContextMenu(contextMenu);
}
