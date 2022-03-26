import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "@/assets/tailwind.css";

declare global {
  interface Window {
    ipc?: {
      send: (channel: string, ...data: any[]) => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      on: (channel: string, func: (...args: any[]) => void) => void;
    };
  }
}

const app = createApp(App);
app.use(store).use(router).mount("#app");
