import { NOTIFICATION_TIMEOUT } from "./../constants";
import { Notification, nativeImage } from "electron";

let notifs: Notification[] = [];

export function showNotification(
  game_name: string,
  msg: string,
  temp: boolean
) {
  const notif = new Notification({
    icon: nativeImage.createFromDataURL("/icon.png"),
    title: "Message from " + game_name,
    body: msg,
  });
  notif.show();

  if (temp) setTimeout(() => notif.close(), NOTIFICATION_TIMEOUT);
  else {
    //TODO Fix issue tracked here: https://github.com/electron/electron/issues/32260
    notifs.push(notif);
  }
}

export function closeNotifications() {
  for (const x of notifs) x.close();
  notifs = [];
}
