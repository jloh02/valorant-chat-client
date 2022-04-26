import { contextBridge, ipcRenderer } from "electron";

const validChannels = [
  "IPC_STATUS", //IPC_READY (To Main), LOCKFILE_UPDATE (To Renderer)
  "VALORANT_PRESENCES", //1-way channel to send presence updates/deletes to renderer
  "VALORANT_CHAT", //SEND (To Main), FRIENDS (Renderer Req), HISTORY (To Renderer), MESSAGE (To Renderer)
  "VALORANT_PARTY", //JOIN, INVITE
  "WINDOW", //Use MINMAX, MINIMIZE or CLOSE (To Main) to replace frame functions; NOTIFY (To Main) to show notification
];
contextBridge.exposeInMainWorld("ipc", {
  send: (channel, ...args) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },
  on: (channel, func) => {
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  invoke: (channel, ...args) => {
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
  },
});
