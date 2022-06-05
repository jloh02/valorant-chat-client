import { App, BrowserWindow, Menu, Tray, nativeImage } from "electron";
import { setPreference, getPreference } from "./preferences";
import b64Icon from "@assets/icon.png";

export function createTray(app: App, win: BrowserWindow, tray: Tray) {
  if (tray) return;
  tray = new Tray(nativeImage.createFromDataURL(b64Icon));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open VALORANT Chat",
      click: () => {
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
          checked: getPreference("minimizeToTray") as boolean,
          click: () => {
            setPreference(
              "minimizeToTray",
              !getPreference("minimizeToTray") as boolean
            );
          },
        },
        {
          type: "checkbox",
          label: "Enable Notifications",
          checked: getPreference("notifications") as boolean,
          click: () => {
            setPreference(
              "notifications",
              !getPreference("notifications") as boolean
            );
          },
        },
      ]),
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        win.close();
        app.quit();
      },
    },
  ]);
  tray.on("click", () => {
    win.show();
  });
  tray.setToolTip("VALORANT Chat Client");
  tray.setContextMenu(contextMenu);
}
