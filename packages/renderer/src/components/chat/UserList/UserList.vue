<template>
  <div class="user-list">
    <div class="search-box">
      <search class="chat-search-icon" />
      <input
        v-model="searchField"
        class="search-input"
        type="text"
        placeholder="Search"
      />
    </div>
    <user-list-context-menu ref="contextMenu" />
    <ul class="user-list-presences">
      <div :key="selfPuuid" class="user-list-item-div">
        <div class="user-list-item-button" style="cursor:default">
          <user-list-item
            :active="false"
            :activeParty="presences.get(selfPuuid)?.partyId === activeParty"
            :firstInParty="true"
            :unread="false"
            :puuid="selfPuuid"
            :gameName="gameName"
          />
        </div>
        <user-list-party-entry
          v-if="
            presences.has(selfPuuid) &&
            presences.get(selfPuuid)?.partyId !=
              presences.get(filteredFriends[0]?.puuid)?.partyId
          "
          :active="false"
          :partyCount="presences.get(selfPuuid)?.partySize ?? 1"
        />
      </div>
      <div
        v-for="[idx, f] of filteredFriends.entries()"
        :key="f.puuid"
        :ref="(el) => refTags.set(f.puuid, el as Element)"
        class="user-list-item-div"
      >
        <button
          class="user-list-item-button"
          @click="
            props.setActiveFn(f.puuid, presences.get(f.puuid)?.partyId ?? '')
          "
          @contextmenu="
            presences.has(f.puuid) ? openCtxMenu($event, f.puuid) : undefined
          "
        >
          <user-list-item
            :active="f.puuid === active"
            :activeParty="presences.get(f.puuid)?.partyId === activeParty"
            :firstInParty="
              idx === 0 ||
              presences.get(f.puuid)?.partyId !==
                presences.get(filteredFriends[idx - 1]?.puuid)?.partyId
            "
            :unread="unreadChats.has(f.puuid)"
            :puuid="f.puuid"
            :gameName="f.gameName"
          />
        </button>
        <user-list-item-overlay
          :friend="f"
          :presence="presences.get(f.puuid)"
        />
        <user-list-party-entry
          v-if="
            presences.has(f.puuid) &&
            presences.get(f.puuid)?.partyId !=
              presences.get(filteredFriends[idx + 1]?.puuid)?.partyId
          "
          :active="
            f.puuid === active ||
            presences.get(f.puuid)?.partyId === activeParty
          "
          :partyCount="presences.get(f.puuid)?.partySize ?? 1"
        />
      </div>
    </ul>
  </div>
</template>

<script lang="ts" setup>
import { computed, ComputedRef, nextTick, reactive, ref } from "vue";
import { useStore } from "vuex";
import Search from "@icons/Search.vue";
import ValorantFriend from "@interfaces/ValorantFriend";
import ValorantPresence from "@interfaces/ValorantPresence";
import UserListItem from "./UserListItem.vue";
import UserListContextMenu from "./ContextMenu/UserListContextMenu.vue";
import UserListItemOverlay from "./UserListItemOverlay.vue";
import UserListPartyEntry from "./UserListPartyEntry.vue";

const store = useStore();
const selfPuuid: ComputedRef<string> = computed(() => store.state.puuid);
const gameName: ComputedRef<string> = computed(() => store.state.gameName);
const presences: ComputedRef<Map<string, ValorantPresence>> = computed(
  () => store.state.presences
);

const props = defineProps<{
  active: string;
  activeParty: string;
  unreadChats: Set<string>;
  friends: ValorantFriend[];
  setActiveFn: (puuid: string, partyId: string) => void;
}>();

const searchField = ref("");

//Filter based on search
const filteredFriends = computed((): ValorantFriend[] =>
  props.friends.filter((friend: ValorantFriend) => {
    if (searchField.value.length === 0) return true;
    return (
      friend.gameName
        ?.toLowerCase()
        .includes(searchField.value.toLowerCase()) ||
      (friend.note?.length &&
        friend.note?.toLowerCase().includes(searchField.value.toLowerCase()))
    );
  })
);

const contextMenu = ref<InstanceType<typeof UserListContextMenu>>();
function openCtxMenu(event: MouseEvent, puuid: string) {
  const pres = presences.value.get(puuid);
  if (pres)
    contextMenu.value?.setPosition(
      event.pageX,
      event.pageY,
      puuid,
      pres.partyId,
      pres.name,
      pres.tag
    );
}

const refTags = reactive(new Map<string, Element>());
function scrollChatListToPuuid(puuid: string) {
  nextTick().then(() => {
    const el: Element | undefined = refTags.get(puuid);
    if (el)
      el.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  });
}

defineExpose({ scrollChatListToPuuid });
</script>

<style lang="scss" scoped>
.user-list {
  @extend .flex-col;
  flex: 0 0 min(calc(33.33333% + 1rem), 300px);
  margin: 0.5rem;
}
.search-box {
  @extend .flex;
  min-height: 2.5rem;
  width: 80%;
  height: 2.5rem;
  padding: 0.25rem 0.75rem;
  margin: 0.25rem auto;
  background-color: $background-lighter;
  border-radius: 0.125rem;
  overflow: hidden;

  :focus {
    outline: none;
  }
}

.search-input {
  width: 100%;
  background-color: $background-lighter;
}
.chat-search-icon {
  height: 80%;
  width: auto;
  padding: 0.25rem;
}
.user-list-presences {
  @extend .flex-col;
  @extend .max-size;
  overflow-y: scroll;
  padding: 0;
  margin: 0.25rem 0;
}
.user-list-item-div {
  @extend .flex-col;
  width: 100%;
  height: auto;
  box-sizing: border-box;
  padding: 0;
  position: relative;

  .user-list-item-button {
    width: 100%;
    padding: 0;
    position: relative;
    background-color: transparent;
    cursor: pointer;
  }
}
</style>
