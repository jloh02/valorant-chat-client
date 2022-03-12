import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Chat from "@/renderer/views/Chat.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Chat",
    component: Chat,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
