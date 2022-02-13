<template>
  <div class="chat">
    <div id="chat-dashboard">Test</div>
    <div id="chat-list">
      <div id="chat-search">
        <font-awesome-icon class="chat-search-icon" icon="search" />
        <input id="search-box" type="text" placeholder="Search" />
      </div>
      <ul class="chat-list-presences">
        <chat-list-item
          v-for="f in this.friends"
          :key="f"
          :active="f.puuid == this.active"
          :puuid="f.puuid"
          :presence="presence"
        />
        <chat-list-item :active="this.active" puuid="test" presence="test" />
        <chat-list-item :active="this.active" puuid="test" presence="test" />
        <chat-list-item :active="this.active" puuid="test" presence="test" />
        <chat-list-item :active="this.active" puuid="test" presence="test" />
        <chat-list-item :active="this.active" puuid="test" presence="test" />
        <chat-list-item :active="this.active" puuid="test" presence="test" />
        <chat-list-item :active="this.active" puuid="test" presence="test" />
        <chat-list-item :active="this.active" puuid="test" presence="test" />
        <chat-list-item :active="this.active" puuid="test" presence="test" />
        <chat-list-item :active="this.active" puuid="test" presence="test" />
        <chat-list-item :active="this.active" puuid="test" presence="test" />
        <chat-list-item :active="this.active" puuid="test" presence="test" />
        <chat-list-item :active="this.active" puuid="test" presence="test" />
        <chat-list-item :active="this.active" puuid="testA" presence="test" />
        <chat-list-item :active="this.active" puuid="test" presence="test" />
        <chat-list-item :active="this.active" puuid="test" presence="test" />
        <chat-list-item :active="this.active" puuid="test" presence="test" />
        <chat-list-item :active="this.active" puuid="test" presence="test" />
        <chat-list-item :active="this.active" puuid="test" presence="test" />
        <chat-list-item :active="this.active" puuid="testF" presence="test" />
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ChatListItem from "@/components/ChatListItem.vue";

export default defineComponent({
  name: "Chat",
  components: { ChatListItem },
  props: ["presences"],
  data() {
    return {
      active: "",
      friends: [],
      unreadChats: new Set(),
      messages: new Map(),
    };
  },
  mounted() {
    while (!window.ipc);

    window.ipc.invoke("VALORANT_CHAT_FRIENDS").then((httpFriends) => {
      this.friends = httpFriends["data"]["friends"];
      let presTemp = this.$store.state.presences;
      let unreadTemp = this.unreadChats;
      let msgsTemp = this.messages;

      if (!window.ipc) return;
      window.ipc.invoke("VALORANT_CHAT_HISTORY").then((httpChat) => {
        for (var msg of httpChat["data"]["messages"]) {
          if (msg["cid"] != msg["pid"]) return;
          if (!msg["read"]) unreadTemp.add(msg["puuid"]);
          if (!msgsTemp.has(msg["puuid"])) msgsTemp.set(msg["puuid"], []);
          msgsTemp.get(msg["puuid"]).push(msg["body"]);
        }
      });

      this.friends.sort(function (a, b) {
        const readA = unreadTemp.has(a["puuid"]);
        const readB = unreadTemp.has(a["puuid"]);
        if (readA != readB) return (readA ? 1 : 0) - (readB ? 1 : 0);

        const onlineA = presTemp.has(a["puuid"]);
        const onlineB = presTemp.has(a["puuid"]);
        if (onlineA != onlineB) return (onlineB ? 1 : 0) - (onlineA ? 1 : 0);

        //TODO online/offline grouping

        //TODO party grouping

        return ("" + a["game_name"]).localeCompare(b["game_name"]);
      });
    });
  },
});
</script>

<style lang="postcss">
.chat {
  max-height: calc(100% - 3rem);
  @apply flex;
}
#chat-dashboard {
  @apply flex flex-col w-full;
}

#chat-list {
  @apply flex flex-col w-1/3
  items-center
  m-2;
}

#chat-search {
  min-height: 2.5rem;
  @apply flex w-4/5 h-10 px-3 py-1 my-1 bg-gray-700
  justify-start items-center 
  rounded-sm overflow-hidden
  focus:outline-none;
}
#chat-search .chat-search-icon {
  @apply h-4/5 w-auto p-1;
}
#search-box {
  @apply w-full bg-gray-700;
}

.chat-list-presences {
  @apply flex flex-col overflow-y-scroll;
}
.chat-list-presences::-webkit-scrollbar {
  @apply w-1;
}
.chat-list-presences::-webkit-scrollbar-track {
  box-shadow: inset 0 0 0 transparent;
}
.chat-list-presences::-webkit-scrollbar-thumb {
  @apply bg-transparent outline-none rounded-sm;
}
.chat-list-presences:hover::-webkit-scrollbar-thumb {
  @apply bg-gray-700 transition-colors;
}
</style>
