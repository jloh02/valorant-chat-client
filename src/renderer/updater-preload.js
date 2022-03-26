import { contextBridge, ipcRenderer } from "electron";

const validChannels = [
  "UPDATE", //Only for auto-updater to use UPDATE and CANCEL
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
