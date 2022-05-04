import path from "path";
import { App, BrowserWindow, Menu, Tray } from "electron";
import { flip_preference, get_preference } from "./preferences";

export function initialize_tray(app: App, win: BrowserWindow, tray: Tray) {
  tray = new Tray(process.env.NODE_ENV == "production" ? path.join(__dirname, "/icon.png") : "build/icons/icon.png");
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open VALORANT Chat",
      click: function () {
        win.show();
      },
    },
    {
      type: "submenu",
      label: "Options",
      submenu: Menu.buildFromTemplate([
        {
          type: "checkbox",
          label: "Minimize to Tray",
          checked: get_preference("minimizeToTray"),
          click: function () {
            flip_preference("minimizeToTray");
          },
        },
        {
          type: "checkbox",
          label: "Enable Notifications",
          checked: get_preference("notifications"),
          click: function () {
            flip_preference("notifications");
          },
        },
      ]),
    },
    { type: "separator" },
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
