import { contextBridge, ipcRenderer } from "electron";

const validChannels = [
  "LOCKFILE_UPDATE",
  "VALORANT_PRESENCES",
  "VALORANT_SOCKET_READY",
  "VALORANT_SOCKET_SUBSCRIBE",
  "VALORANT_SOCKET_UNSUBSCRIBE",
  "VALORANT_CHAT_SEND",
  "VALORANT_CHAT_FRIENDS",
  "VALORANT_CHAT_HISTORY",
];
contextBridge.exposeInMainWorld("ipc", {
  send: (channel, data) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  sendSync: (channel, data) => {
    if (validChannels.includes(channel)) {
      return ipcRenderer.sendSync(channel, data);
    }
  },
  on: (channel, func) => {
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(args));
    }
  },
});
