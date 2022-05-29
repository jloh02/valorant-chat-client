<template>
  <li :class="active ? 'user-list-item active' : 'user-list-item'">
    <img
      v-if="presence && card.length"
      class="user-list-item card"
      :src="card"
    />
    <img v-else src="/valo-icon.svg" class="user-list-item card" />

    <div class="user-list-item text">
      <p class="user-list-item game-name">
        {{ friend.gameName }}
      </p>
      <p v-if="presence" :class="'user-list-item game-status ' + statusColor">
        {{ status }}
      </p>
    </div>

    <div v-if="unread" class="user-list-item unread-circle" />
    <div v-else class="user-list-item unread-circle placeholder" />
  </li>
</template>

<script lang="ts" setup>
import { computed, ComputedRef, ref, watch } from "vue";
import { useStore } from "vuex";
import { getPlayerCardSrc } from "@/ts/valorant-api";
import ValorantFriend from "@interfaces/ValorantFriend";
import ValorantPresence from "@interfaces/ValorantPresence";

const store = useStore();

const card = ref("");
const status = ref("");
const statusColor = ref("");

const props = defineProps<{
  active: boolean;
  puuid: string;
  friend: ValorantFriend;
  unread: boolean;
}>();

//Presence monitoring to update current friend's status
const presence: ComputedRef<ValorantPresence | undefined> = computed(() =>
  store.state.presences.get(props.puuid)
);
function capsFirstLetter(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1);
}
function updatePresence() {
  if (presence.value && presence.value.cardId) {
    getPlayerCardSrc(presence.value.cardId).then((cardRet) => {
      if (cardRet) card.value = cardRet;
    });

    if (presence.value.state === "away") {
      status.value = "Away";
      statusColor.value = "away";
    } else if (presence.value.gameState === "INGAME") {
      statusColor.value = "ingame";
      if (presence.value.gameMode === "In Range") {
        status.value = "In Range";
      } else {
        status.value = `${capsFirstLetter(presence.value.gameMode)} ${
          presence.value.scoreAlly
        }-${presence.value.scoreEnemy}`;
      }
    } else if (presence.value.gameState === "MENUS") {
      status.value = "Online";
      statusColor.value = "online";
    } /*PREGAME*/ else {
      status.value = `Agent Select (${capsFirstLetter(
        presence.value.gameMode
      )})`;
      statusColor.value = "ingame";
    }
  }
}
watch([presence], () => {
  updatePresence();
});
updatePresence();
</script>

<style lang="scss" scoped>
li.user-list-item {
  height: 100%;
  text-align: left;
  padding: 0.25rem;
}
.user-list-item {
  @extend .flex;
  padding: 0;

  &.active {
    background-color: $background-lighter;
    border-radius: 0.25rem;
  }

  &.card {
    min-height: 2.5rem;
    min-width: 2.5rem;
    padding: 0 0.25rem;
    height: 2.5rem;
    width: 2.5rem;
  }

  &.text {
    @extend .flex-col;
    flex: 1;
    padding-left: 0.25rem;
    align-items: flex-start;
    pointer-events: none;

    .game-name {
      @extend .text;
      padding-left: 0 !important;
    }

    .game-status {
      font-size: 0.75rem;
      line-height: 1rem;

      &.online {
        color: #22c55e;
      }
      &.away {
        color: #eab308;
      }
      &.ingame {
        color: #3b82f6;
      }
    }
  }

  .unread-circle {
    margin: 0 0.5rem;
    width: 0.75rem;
    background-color: $valo-red;
    border-radius: 50%;

    &.placeholder {
      background-color: transparent;
    }
  }
}
</style>
