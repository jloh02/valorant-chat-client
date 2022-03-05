import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/tailwind.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faSearch,
  faUsers,
  faFileLines,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

library.add(faSearch, faUsers, faFileLines);

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
app.component("font-awesome-icon", FontAwesomeIcon);
app.use(router).use(store).mount("#app");
