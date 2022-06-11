<template>
  <li
    :class="
      'user-list-item' +
      (active ? ' active' : '') +
      (activeParty ? ' active-party' : '')
    "
  >
    <div :class="'user-list-item card-box' + (firstInParty ? ' first' : '')">
      <img
        v-if="presence && card.length"
        class="user-list-item card"
        :src="card"
      />
      <img v-else src="/valo-icon.svg" class="user-list-item card" />
    </div>

    <div class="user-list-item text">
      <p class="user-list-item game-name">
        {{ gameName }}
      </p>
      <p v-if="presence" :class="'user-list-item game-status ' + statusColor">
        {{ status }}
      </p>
    </div>

    <div class="user-list-item unread-circle-box">
      <div v-if="unread" class="user-list-item unread-circle" />
      <div v-else class="user-list-item unread-circle placeholder" />
    </div>
  </li>
</template>

<script lang="ts" setup>
import { computed, ComputedRef, ref, watch } from "vue";
import { useStore } from "vuex";
import { getPlayerCardSrc } from "@/ts/valorant-api";
import ValorantPresence from "@interfaces/ValorantPresence";

const store = useStore();

const card = ref("");
const status = ref("");
const statusColor = ref("");

const props = defineProps<{
  active: boolean;
  activeParty: boolean;
  firstInParty: boolean;
  puuid: string;
  gameName: string;
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
  padding: 0;
  margin-right: 0.25rem;
}
*.user-list-item {
  @extend .flex;
  padding: 0;

  &.active {
    .unread-circle-box {
      border-top-right-radius: 0.25rem;
      border-bottom-right-radius: 0.25rem;
    }

    .card-box,
    .text,
    .unread-circle-box {
      background-color: $background-lighter;
    }
  }
  &.active-party {
    div.card-box {
      background-color: $background-lighter;

      &.first {
        border-top-left-radius: 0.25rem;
      }
    }

    &:not(.active) div.card-box.first {
      border-top-right-radius: 0.25rem;
    }
  }
  &:not(.active-party).active div.card-box {
    border-top-left-radius: 0.25rem;
    border-bottom-left-radius: 0.25rem;
  }

  &.card {
    min-height: 2.5rem;
    min-width: 2.5rem;
    padding: 0 0.25rem;
    height: 2.5rem;
    width: 2.5rem;
  }

  &.card-box {
    padding: 0.25rem;
    height: 100%;
    box-sizing: border-box;
    background-color: transparent;
  }

  &.text {
    @extend .flex-col;
    flex: 1;
    justify-content: center;
    align-items: flex-start;
    padding: 0.25rem;
    height: 100%;
    box-sizing: border-box;
    pointer-events: none;

    p.user-list-item.game-name {
      @extend .text;
      padding: 0;
      padding-top: 0.125rem;
      flex: 1;
    }

    .game-status {
      padding: 0;
      padding-bottom: 0.375rem;
      flex: 1;
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

  .unread-circle-box {
    height: 100%;
  }
  .unread-circle {
    margin: 0 0.5rem;
    height: 0.75rem;
    width: 0.75rem;
    background-color: $valo-red;
    border-radius: 50%;

    &.placeholder {
      background-color: transparent;
    }
  }
}
</style>
