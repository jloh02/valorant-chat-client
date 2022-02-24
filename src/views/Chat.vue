<template>
  <div class="chat">
    <div id="chat-dashboard">
      <ul class="chat-dashboard messages">
        <chat-message
          v-for="(msg, idx) in this.messages.get(this.active)"
          :key="idx"
          :outgoing="msg.outgoing"
          :message="msg.message"
        />
      </ul>
    </div>
    <div id="chat-list">
      <div id="chat-search">
        <font-awesome-icon class="chat-search-icon" icon="search" />
        <input id="search-box" type="text" placeholder="Search" />
      </div>
      <ul class="chat-list-presences">
        <button
          v-for="f in this.friends"
          :key="f.puuid"
          @click="setActive(f.puuid)"
        >
          <chat-list-item
            :active="f.puuid == this.active"
            :unread="unreadChats.has(this.active)"
            :puuid="f.puuid"
            :data="f"
            :presence="this.presences.get(f.puuid)"
          />
        </button>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import ChatListItem from "@/components/ChatListItem.vue";
import ChatMessage from "@/components/ChatMessage.vue";

export default defineComponent({
  name: "Chat",
  components: { ChatListItem, ChatMessage },
  data() {
    return {
      active: "",
      friends: [],
      unreadChats: new Set(),
      messages: new Map(),
    };
  },
  computed: {
    presences() {
      return this.$store.state.presences;
    },
  },
  methods: {
    setActive(puuid: string) {
      this.active = puuid;
      this.unreadChats.delete(puuid);
      console.log(this.messages);
      console.log(this.messages.get(this.active));
    },
  },
  mounted() {
    while (!window.ipc);

    window.ipc.invoke("VALORANT_CHAT_FRIENDS").then((httpFriends) => {
      this.friends = httpFriends["data"]["friends"];
      let presTemp = this.presences;
      let unreadTemp = this.unreadChats;
      let msgsTemp = this.messages;

      if (!window.ipc) return;
      window.ipc.invoke("VALORANT_CHAT_HISTORY").then((httpChat) => {
        for (var msg of httpChat["data"]["messages"]) {
          console.log(msg);

          const msgCidPuuid = msg["cid"].slice(0, msg["cid"].indexOf("@"));
          console.log(msgCidPuuid);

          if (!msg["read"]) unreadTemp.add(msg["puuid"]);
          if (!msgsTemp.has(msgCidPuuid)) msgsTemp.set(msgCidPuuid, []);

          msgsTemp.get(msgCidPuuid).push({
            outgoing: msg["puuid"] != msgCidPuuid,
            message: msg["body"],
          });
        }
      });

      this.friends.sort(function (a, b) {
        const readA = unreadTemp.has(a["puuid"]);
        const readB = unreadTemp.has(b["puuid"]);
        if (readA != readB) return (readA ? 1 : 0) - (readB ? 1 : 0);

        const onlineA = presTemp.has(a["puuid"]);
        const onlineB = presTemp.has(b["puuid"]);
        if (onlineA != onlineB) return (onlineB ? 1 : 0) - (onlineA ? 1 : 0);

        //TODO online/offline grouping

        //TODO party grouping

        return ("" + a["game_name"]).localeCompare(b["game_name"]);
      });

      this.active = this.friends[0]["puuid"];
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
  @apply flex flex-col w-full m-2;
}

.chat-dashboard.messages {
  @apply overflow-y-scroll;
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
  @apply flex flex-col overflow-y-scroll w-full;
}

ul::-webkit-scrollbar {
  @apply w-1;
}
ul::-webkit-scrollbar-track {
  box-shadow: inset 0 0 0 transparent;
}
ul::-webkit-scrollbar-thumb {
  @apply bg-transparent outline-none rounded-sm;
}
ul:hover::-webkit-scrollbar-thumb {
  @apply bg-gray-700 transition-colors;
}
</style>
