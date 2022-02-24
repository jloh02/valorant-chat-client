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
      <div class="chat-dashboard input-bar">
        <div class="chat-dashboard input-bar label">
          <p>{{ this.puuidToName.get(this.active) }}</p>
        </div>
        <input
          id="text-msg-input"
          type="text"
          placeholder="Enter message here"
          class="chat-dashboard input-bar input"
        />
      </div>
    </div>
    <div id="chat-list">
      <div id="chat-search">
        <font-awesome-icon class="chat-search-icon" icon="search" />
        <input
          v-model="this.searchField"
          id="search-box"
          type="text"
          placeholder="Search"
        />
      </div>
      <ul class="chat-list-presences">
        <button
          v-for="f in this.filteredFriends"
          :key="f.puuid"
          @click="setActive(f.puuid)"
        >
          <chat-list-item
            :active="f.puuid == this.active"
            :unread="unreadChats.has(this.active)"
            :puuid="f.puuid"
            :data="f"
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

//TODO start messages scrolled to bottom

export default defineComponent({
  name: "Chat",
  components: { ChatListItem, ChatMessage },
  data() {
    return {
      active: "",
      friends: [],
      searchField: "",
      puuidToName: new Map(),
      unreadChats: new Set(),
      messages: new Map(),
    };
  },
  computed: {
    //Filter then sort friends
    filteredFriends(): any[] {
      console.log(this.friends);

      //Object references to avoid ambiguous "this" error
      let unreadTemp = this.unreadChats;
      let presTemp = this.$store.state.presences;
      let searchField = this.searchField;

      return this.friends
        .filter(function (friend: any) {
          if (searchField.length == 0) return true;
          if (
            friend["game_name"]
              .toLowerCase()
              .startsWith(searchField.toLowerCase())
          )
            return true;
          if (
            friend["note"].length &&
            friend["note"].toLowerCase().startsWith(searchField.toLowerCase())
          )
            return true;
          return false;
        })
        .sort(function (a, b) {
          const readA = unreadTemp.has(a["puuid"]);
          const readB = unreadTemp.has(b["puuid"]);
          if (readA != readB) return (readA ? 1 : 0) - (readB ? 1 : 0);

          const onlineA = presTemp.has(a["puuid"]);
          const onlineB = presTemp.has(b["puuid"]);
          if (onlineA != onlineB) return (onlineB ? 1 : 0) - (onlineA ? 1 : 0);

          //TODO party grouping

          return ("" + a["game_name"]).localeCompare(b["game_name"]);
        });
    },
  },
  methods: {
    setActive(puuid: string) {
      this.active = puuid;
      this.unreadChats.delete(puuid);
    },
    updateMessages(messages: any[]) {
      for (var msg of messages) {
        const msgCidPuuid = msg["cid"].slice(0, msg["cid"].indexOf("@"));

        if (!msg["read"]) this.unreadChats.add(msg["puuid"]);
        if (!this.messages.has(msgCidPuuid)) this.messages.set(msgCidPuuid, []);

        this.messages.get(msgCidPuuid).push({
          outgoing: msg["puuid"] != msgCidPuuid,
          message: msg["body"],
        });
      }
    },
  },
  mounted() {
    while (!window.ipc);

    window.ipc.invoke("VALORANT_CHAT_FRIENDS").then((httpFriends) => {
      this.friends = httpFriends["data"]["friends"];

      if (!window.ipc) return;
      window.ipc.invoke("VALORANT_CHAT_HISTORY").then((httpChat) => {
        this.updateMessages(httpChat["data"]["messages"]);
        this.active = this.filteredFriends[0]["puuid"];
      });

      this.friends.forEach((f) => {
        this.puuidToName.set(f["puuid"], f["game_name"]);
      });
    });

    // window.ipc.send(
    //   "VALORANT_SOCKET_SUBSCRIBE",
    //   "OnJsonApiEvent_chat_v6_messages",
    //   (data: JSON) => {}
    // );
  },
});
</script>

<style lang="postcss">
.chat {
  max-height: calc(100% - 3rem);
  height: calc(100% - 3rem);
  @apply flex;
}
#chat-dashboard {
  @apply flex flex-col justify-end w-full m-2;
}

.chat-dashboard.messages {
  @apply overflow-y-scroll pr-3;
}

.chat-dashboard.input-bar {
  @apply flex bg-stone-600 w-full m-1 rounded;
}
.chat-dashboard.input-bar.label {
  @apply bg-stone-700 min-w-fit w-1/5 m-0 p-1 px-3 rounded-r-none whitespace-nowrap;
}
.chat-dashboard.input-bar.input {
  @apply bg-transparent w-full m-0 p-1 px-3 active:border-none;
}

#chat-list {
  min-width: 33.333%;
  max-width: 33.333%;
  @apply flex flex-col w-1/3
  items-center
  my-2 mr-2;
}

#chat-search {
  min-height: 2.5rem;
  @apply flex w-4/5 h-10 px-3 py-1 my-1 bg-stone-700
  justify-start items-center 
  rounded-sm overflow-hidden
  focus:outline-none;
}
#chat-search .chat-search-icon {
  @apply h-4/5 w-auto p-1;
}
#search-box {
  @apply w-full bg-stone-700;
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
  @apply bg-stone-700 transition-colors;
}
</style>
