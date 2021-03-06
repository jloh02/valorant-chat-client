import { contextBridge, ipcRenderer } from "electron";

const validChannels = [
  "IPC_STATUS", //IPC_READY (To Main), LOCKFILE_UPDATE (To Renderer)
  "VALORANT_PRESENCES", //1-way channel to send presence updates/deletes to renderer
  "VALORANT_CHAT", //SEND (To Main), FRIENDS (Renderer Req), HISTORY (To Renderer), MESSAGE (To Renderer)
  "VALORANT_PARTY", //JOIN, INVITE
  "WINDOW", //Use MINMAX, MINIMIZE or CLOSE (To Main) to replace frame functions; NOTIFY (To Main) to show notification
  "UPDATE", //SHOW (2-Way), UPDATE (To Main), PROGRESS (To Renderer), CANCEL (To Main) for Updater
];
contextBridge.exposeInMainWorld("ipc", {
  send: (channel: string, ...args: any[]) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },
  on: (channel: string, callback: (...args: any[]) => any) => {
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => {
        callback(...args);
      });
    }
  },
  invoke: (channel: string, ...args: any[]) => {
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
  },
  removeAllListeners: (channel: string) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.removeAllListeners(channel);
    }
  },
});
