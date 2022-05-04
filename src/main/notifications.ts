import path from "path";
import { Notification } from "electron";

let notifs: Notification[] = [];

export function showNotification(
  game_name: string,
  msg: string,
  temp: boolean
) {
  const notif = new Notification({
    icon:
      process.env.NODE_ENV == "production"
        ? path.join(__dirname, "/icon.png")
        : "build/icons/icon.png",
    title: "Message from " + game_name,
    body: msg,
  });
  notif.show();

  if (temp) setTimeout(() => notif.close(), 5000);
  else {
    //TODO Fix issue tracked here: https://github.com/electron/electron/issues/32260
    notifs.push(notif);
  }
}

export function closeNotifications() {
  for (let x of notifs) {
    x.close();
  }
  notifs = [];
}
