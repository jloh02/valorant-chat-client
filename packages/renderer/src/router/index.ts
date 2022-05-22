import { createRouter, createWebHashHistory } from "vue-router";
import ChatApp from "../chat/ChatApp.vue";
import Updater from "../updater/Updater.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      name: "Chat",
      component: ChatApp,
    },
    {
      path: "/updater",
      name: "Updater",
      component: Updater,
    },
  ],
});

export default router;