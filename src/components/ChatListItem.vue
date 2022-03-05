<template>
  <li :class="getBoxClass">
    <img v-if="this.card.length" class="chat-list-item card" :src="this.card" />
    <valo-icon-svg v-else class="chat-list-item card" />

    <div class="chat-list-item text">
      <p class="chat-list-item game-name">
        {{ this.data.game_name }}
      </p>
      <p
        v-if="this.presence"
        :class="'chat-list-item game-status ' + this.statusColor"
      >
        {{ this.status }}
      </p>
    </div>

    <div v-if="this.unread" class="chat-list-item unread-circle" />
    <div v-else class="chat-list-item unread-circle placeholder" />
  </li>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { getPlayerCardSrc } from "@/js/valo-api";
import ValoIconSvg from "@/components/ValoIconSvg.vue";
import { ValorantPresence } from "@/types/valorant-presence";

function capsFirstLetter(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

export default defineComponent({
  name: "ChatListItem",
  props: ["active", "puuid", "data", "unread"],
  components: { ValoIconSvg },
  data: () => {
    return { card: "", status: "", statusColor: "" };
  },
  computed: {
    getBoxClass() {
      return this.active ? "chat-list-item active" : "chat-list-item";
    },
    presence() {
      return this.$store.state.presences.get(this.puuid);
    },
  },
  watch: {
    presence: function (p) {
      this.updatePresence(p);
    },
  },
  methods: {
    updatePresence(presence: ValorantPresence | undefined) {
      if (presence && presence.card_id) {
        getPlayerCardSrc(presence.card_id).then((card) => {
          if (card) this.card = card;
        });

        if (presence.state == "away") {
          this.status = "Away";
          this.statusColor = "away";
        } else if (presence.game_state == "INGAME") {
          this.statusColor = "ingame";
          if (presence.game_mode == "In Range") {
            this.status = "In Range";
          } else {
            this.status = `${capsFirstLetter(presence.game_mode)} ${
              presence.score_ally
            }-${presence.score_enemy}`;
          }
        } else if (presence.game_state == "MENUS") {
          this.status = "Online";
          this.statusColor = "online";
        } /*PREGAME*/ else {
          this.status = `Agent Select (${capsFirstLetter(presence.game_mode)})`;
          this.statusColor = "ingame";
        }
      }
    },
  },
  created() {
    this.updatePresence(this.presence);
  },
});
</script>

<style lang="postcss">
li.chat-list-item {
  @apply flex justify-start items-center text-left h-full px-1 py-1;
}

.chat-list-item {
  @apply flex;
}

.chat-list-item.active {
  @apply bg-stone-700 rounded-sm;
}

.chat-list-item.card {
  min-height: 3rem;
  min-width: 3rem;
  @apply h-12 w-12 p-1;
}
.chat-list-item.text {
  @apply flex-1 flex flex-col p-1;
}
.chat-list-item.text .game-name {
  @apply text-base;
}
.chat-list-item.text .game-status {
  @apply text-xs;
}

.chat-list-item.text .game-status.online {
  @apply text-green-500;
}
.chat-list-item.text .game-status.away {
  @apply text-yellow-500;
}
.chat-list-item.text .game-status.ingame {
  @apply text-blue-500;
}

.chat-list-item.unread-circle {
  @apply mx-2 w-3 h-3 bg-red-600 rounded-full;
}

.chat-list-item.unread-circle.placeholder {
  @apply bg-transparent;
}
</style>
