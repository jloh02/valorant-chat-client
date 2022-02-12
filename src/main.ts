import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./assets/tailwind.css";

declare global {
  interface Window {
    ipc?: {
      send: (channel: string, ...data: any[]) => void;
      sendSync: (channel: string, ...data: any[]) => any;
      on: (channel: string, func: (...args: any[]) => void) => void;
    };
  }
}

createApp(App).use(router).mount("#app");
