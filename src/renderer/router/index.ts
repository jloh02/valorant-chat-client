import { createRouter, createWebHashHistory } from "vue-router";
import ChatApp from "@/renderer/chat/ChatApp.vue";
import Updater from "@/renderer/updater/Updater.vue";

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
