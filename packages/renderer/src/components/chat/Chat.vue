<template>
  <div class="chat">
    <chat-messages-view
      ref="chatMessagesView"
      :inputLabel="friends.get(active)?.gameName ?? 'Send To'"
      :pid="friends.get(active)?.pid ?? 'nil'"
      :messages="messagesView"
    />
    <user-list
      ref="userList"
      :active="active"
      :activeParty="activeParty"
      :unreadChats="unreadChats"
      :friends="sortedFriends"
      :setActiveFn="setActive"
    />
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted, onUnmounted, computed } from "vue";
import { useStore } from "vuex";
import ValorantFriend from "@interfaces/ValorantFriend";
import ValorantMessage, {
  ValorantSimpleMessage,
} from "@interfaces/ValorantMessage";
import ChatMessagesView from "./ChatMessagesView/ChatMessagesView.vue";
import UserList from "./UserList/UserList.vue";

const store = useStore();
const selfPuuid = computed(() => store.state.puuid);
const presences = computed(() => store.state.presences);

/* ---------------------------- FRIENDS ---------------------------- */
const friends = reactive(new Map<string, ValorantFriend>());
function updateFriends(newFriends: ValorantFriend[]) {
  newFriends.forEach((f: ValorantFriend) => {
    if (f.puuid) friends.set(f.puuid, f);
  });
}

const sortedFriends = computed((): ValorantFriend[] =>
  Array.from(friends.values()).sort((a: ValorantFriend, b: ValorantFriend) => {
    const onlineA = presences.value.has(a.puuid);
    const onlineB = presences.value.has(b.puuid);
    if (onlineA !== onlineB) return (onlineB ? 1 : 0) - (onlineA ? 1 : 0);
    //Sort by party ID if online
    if (onlineA) {
      const partyA = presences.value.get(a.puuid).partyId;
      const partyB = presences.value.get(b.puuid).partyId;
      if (partyA !== partyB) {
        const selfPartyId = presences.value.get(selfPuuid.value)?.partyId;
        if (selfPartyId) {
          if (partyA === selfPartyId) return -1;
          if (partyB === selfPartyId) return 1;
        }
        return partyA.localeCompare(partyB);
      }
    }
    return a.gameName.localeCompare(b.gameName);
  })
);

/* ---------------------------- MESSAGES ---------------------------- */
const chatMessagesView = ref<InstanceType<typeof ChatMessagesView>>();
const allowUnread = ref(false); //Disallow unread notifications for first 3s to allow existing msgs to load
const lastMessageUpdate = ref<number>(); //Timestamp of last message update; For initialization of messages to determine if notification should be displayed
const unreadChats = reactive(new Set<string>()); //Set of unread chats cid

const messages = reactive(
  new Map<string, Map<string, ValorantSimpleMessage>>()
);
const messagesView = computed(() => {
  const msgMap = messages.get(active.value);
  if (!msgMap) return [];
  const msgList: ValorantSimpleMessage[] = Array.from(msgMap.values());
  return msgList.sort((a: ValorantSimpleMessage, b: ValorantSimpleMessage) => {
    return a.timestamp - b.timestamp;
  });
});

const userList = ref<InstanceType<typeof UserList>>();
function updateMessages(newMessages: ValorantMessage[], setUnread?: boolean) {
  newMessages.forEach((msg) => {
    const msgCidPuuid = msg.cid.slice(0, msg.cid.indexOf("@"));
    const msgOutgoing = msg.puuid !== msgCidPuuid;
    if (!messages.has(msgCidPuuid)) messages.set(msgCidPuuid, new Map());
    const msgExists = messages.get(msgCidPuuid)?.has(msg.mid);
    messages.get(msgCidPuuid)?.set(msg.mid, {
      outgoing: msgOutgoing,
      message: msg.body,
      timestamp: msg.time as unknown as number,
    });
    if (setUnread) {
      if (active.value === msgCidPuuid) {
        chatMessagesView.value?.scrollLastMessage(true);
      } else {
        unreadChats.add(msg.puuid);
        userList.value?.scrollChatListToPuuid(msgCidPuuid);
      }
      if (!msgOutgoing && !msgExists)
        window.ipc?.send("WINDOW", "NOTIFY", msg.gameName, msg.body);
    }
  });
}

/* ---------------------------- SETTING ACTIVE CHAT ---------------------------- */
const active = ref("");
const activeParty = ref("");
function setActive(newPuuid: string, newParty: string) {
  active.value = newPuuid;
  activeParty.value = newParty;
  unreadChats.delete(newPuuid);
  chatMessagesView.value?.scrollLastMessage(false);
}

/* ---------------------------- IPC LISTENERS ---------------------------- */
onMounted(() => {
  allowUnread.value = false;
  while (!window.ipc);
  window.ipc.on("VALORANT_CHAT", (command: string, data) => {
    if (command === "MESSAGE") {
      updateMessages(data, allowUnread.value);
      if (!allowUnread.value) {
        const nowMillis = Date.now();
        if (
          lastMessageUpdate.value &&
          nowMillis - lastMessageUpdate.value > 500
        ) {
          allowUnread.value = true;
        } else {
          lastMessageUpdate.value = nowMillis;
        }
      }
    } else if (command === "FRIEND") {
      updateFriends(data);
    }
  });
  window.ipc.invoke("VALORANT_CHAT", "FRIENDS").then((friends) => {
    updateFriends(friends);
    if (!window.ipc) return;
    window.ipc.invoke("VALORANT_CHAT", "HISTORY").then((messages) => {
      updateMessages(messages, false);
      chatMessagesView.value?.scrollLastMessage(false);
      lastMessageUpdate.value = Date.now();
    });
  });
});

onUnmounted(() => {
  window.ipc?.removeAllListeners("VALORANT_CHAT");
});
</script>

<style lang="scss" scoped>
.chat {
  @extend .max-size;
  display: flex;
}
</style>
