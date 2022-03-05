<template>
  <div class="chat">
    <div id="chat-dashboard">
      <ul :key="this.messages" class="chat-dashboard messages">
        <chat-message
          v-for="(msg, idx) in this.messages.get(this.active)"
          :key="idx"
          :outgoing="msg.outgoing"
          :message="msg.message"
        />
        <div ref="dashboardLast" id="chat-dashboard-last" />
      </ul>
      <div class="chat-dashboard input-bar">
        <div class="chat-dashboard input-bar label">
          <p>{{ this.messageFieldLabel }}</p>
        </div>
        <input
          id="text-msg-input"
          type="text"
          placeholder="Enter message here"
          class="chat-dashboard input-bar input"
          v-model="this.messageField"
          @keyup.enter="this.sendMessage"
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
        <div ref="chatListFirst" id="chat-list-first" />
        <div
          v-for="[idx, f] of this.filteredFriends.entries()"
          :key="f.puuid"
          :ref="f.puuid"
          class="chat-list-item-div"
        >
          <button class="chat-list-item-button" @click="setActive(f.puuid)">
            <chat-list-item
              :active="f.puuid == this.active"
              :unread="unreadChats.has(f.puuid)"
              :puuid="f.puuid"
              :data="f"
            />
          </button>
          <chat-list-item-overlay :data="f" />
          <chat-list-party-entry
            v-if="
              this.presences.has(f.puuid) &&
              this.presences.get(f.puuid)?.party_id !=
                this.presences.get(this.filteredFriends[idx + 1]?.puuid)
                  ?.party_id
            "
            :partyCount="this.presences.get(f.puuid)?.party_size"
          />
        </div>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { ValorantFriend } from "@/types/valorant-friend";
import {
  ValorantMessage,
  ValorantSimpleMessage,
} from "@/types/valorant-message";
import ChatMessage from "@/components/ChatMessage.vue";
import ChatListItem from "@/components/ChatListItem.vue";
import ChatListPartyEntry from "@/components/ChatListPartyEntry.vue";
import ChatListItemOverlay from "@/components/ChatListItemOverlay.vue";

export default defineComponent({
  name: "Chat",
  components: {
    ChatListItem,
    ChatMessage,
    ChatListPartyEntry,
    ChatListItemOverlay,
  },
  data() {
    return {
      active: "",
      friends: new Map<string, ValorantFriend>(),
      searchField: "",
      messageField: "",
      messages: new Map<string, ValorantSimpleMessage[]>(),
      addedMessages: new Set<string>(), //Set to maintain which messages (mid) have been processed
      unreadChats: new Set<string>(), //Set of unread chats cid
      allowUnread: false, //Disallow unread notifications for first 3s to allow existing msgs to load
    };
  },
  computed: {
    presences() {
      return this.$store.state.presences;
    },
    messageFieldLabel(): string {
      let activeFriend = this.friends?.get(this.active);
      if (activeFriend) return activeFriend.game_name;
      return "Send To";
    },
    //Filter then sort friends
    filteredFriends(): ValorantFriend[] {
      //Object references to avoid ambiguous "this" error

      let presTemp = this.$store.state.presences;
      let searchField = this.searchField;

      return Array.from(this.friends.values())
        .filter(function (friend: ValorantFriend) {
          if (searchField.length == 0) return true;
          if (
            friend["game_name"]
              .toLowerCase()
              .includes(searchField.toLowerCase())
          )
            return true;
          if (
            friend["note"].length &&
            friend["note"].toLowerCase().includes(searchField.toLowerCase())
          )
            return true;
          return false;
        })
        .sort(function (a: ValorantFriend, b: ValorantFriend) {
          const onlineA = presTemp.has(a["puuid"]);
          const onlineB = presTemp.has(b["puuid"]);
          if (onlineA != onlineB) return (onlineB ? 1 : 0) - (onlineA ? 1 : 0);

          //Sort by party ID if online
          if (onlineA) {
            const partyA = presTemp.get(a["puuid"]).party_id;
            const partyB = presTemp.get(b["puuid"]).party_id;

            if (partyA != partyB) return partyA.localeCompare(partyB);
          }

          return a["game_name"].localeCompare(b["game_name"]);
        });
    },
  },
  methods: {
    setActive(puuid: string) {
      this.unreadChats.delete(this.active);
      this.active = puuid;
      this.scrollDashboardToLast(false);
    },
    updateMessages(messages: ValorantMessage[], setUnread?: boolean) {
      for (var msg of messages) {
        if (this.addedMessages.has(msg["mid"])) continue;
        this.addedMessages.add(msg["mid"]);

        const msgCidPuuid = msg["cid"].slice(0, msg["cid"].indexOf("@"));
        const msgOutgoing = msg["puuid"] != msgCidPuuid;

        if (setUnread && !msgOutgoing) {
          if (this.active == msg["puuid"]) this.scrollDashboardToLast(true);
          else {
            this.scrollChatListToPuuid(msgCidPuuid);
            this.unreadChats.add(msg["puuid"]);
          }
        }
        if (!this.messages.has(msgCidPuuid)) this.messages.set(msgCidPuuid, []);

        this.messages.get(msgCidPuuid)?.push({
          outgoing: msgOutgoing,
          message: msg["body"],
        });
      }
    },
    updateFriends(friends: ValorantFriend[]) {
      friends.forEach((f: ValorantFriend) => this.friends.set(f.puuid, f));
    },
    sendMessage() {
      window.ipc
        ?.invoke(
          "VALORANT_CHAT",
          "SEND",
          this.friends.get(this.active)?.pid,
          this.messageField
        )
        .then((res) => {
          console.log(res);
        });
      this.messageField = "";
    },
    scrollChatListToPuuid(puuid: string) {
      this.$nextTick(() => {
        console.log(puuid);
        console.log(this.$refs);
        const el: any = this.$refs[puuid];
        console.log(el);
        if (el && el[0])
          el[0].scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      });
    },
    scrollDashboardToLast(smooth: boolean) {
      this.$nextTick(() => {
        const el: any = this.$refs.dashboardLast;
        if (el)
          el.scrollIntoView({
            behavior: smooth ? "smooth" : "auto",
            block: "end",
          });
      });
    },
  },
  mounted() {
    while (!window.ipc);

    window.ipc.on("VALORANT_CHAT", (command: string, data) => {
      if (command == "MESSAGE") this.updateMessages(data, this.allowUnread);
      else if (command == "FRIEND") this.updateFriends(data);
    });

    window.ipc.invoke("VALORANT_CHAT", "FRIENDS").then((httpFriends) => {
      this.updateFriends(httpFriends["data"]["friends"]);

      if (!window.ipc) return;
      window.ipc.invoke("VALORANT_CHAT", "HISTORY").then((httpChat) => {
        // console.log(httpChat);
        this.updateMessages(httpChat["data"]["messages"]);
        this.active = this.filteredFriends[0]["puuid"];
        this.scrollDashboardToLast(false);
      });
    });

    setTimeout(() => (this.allowUnread = true), 3000);

    let i = 0;
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
  @apply flex flex-col w-full overflow-y-scroll pr-3;
}

.chat-dashboard.input-bar {
  @apply flex bg-stone-600 w-full m-1 rounded;
}
.chat-dashboard.input-bar.label {
  @apply bg-stone-700 min-w-fit w-1/5 m-0 p-1 px-3 rounded-r-none whitespace-nowrap cursor-default;
}
.chat-dashboard.input-bar.input {
  @apply bg-transparent w-full m-0 p-1 px-3 active:border-none;
}

#chat-list {
  max-width: 300px;
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
.chat-search-icon {
  @apply h-4/5 w-auto p-1;
}
#search-box {
  @apply w-full bg-stone-700;
}

.chat-list-presences {
  @apply flex flex-col overflow-y-scroll w-full;
}

.chat-list-item-div {
  @apply flex flex-col h-full my-1 mx-1 relative;
}

.chat-list-item-div button {
  @apply w-full relative;
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
