import { contextBridge, ipcRenderer } from "electron";

const validChannels = [
  "UPDATE", //Only for auto-updater to use UPDATE and CANCEL
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
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
  invoke: (channel: string, ...args: any[]) => {
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
  },
});
