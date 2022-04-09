import { Notification } from "electron";

let notifs: Notification[] = [];

export function showNotification(game_name: string, msg: string) {
  const notif = new Notification({
    title: "Message from " + game_name,
    body: msg,
  });
  notifs.push(notif);
  notif.show();
}

export function closeNotifications() {
  for(let x of notifs){
    x.close();
  }
  notifs = [];
}
