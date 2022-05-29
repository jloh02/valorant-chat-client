<template>
  <div class="user-list-item-overlay">
    <div class="user-list-item-sub-col">
      <span>{{ props.friend.gameName }}#{{ props.friend.gameTag }}</span>
      <div v-if="props.friend.note !== ''" class="user-list-item-overlay-note">
        <document />
        <span>
          {{ props.friend.note }}
        </span>
      </div>
    </div>
    <div v-if="props.presence" class="user-list-item-sub-col">
      <img
        class="user-list-item-rank-icon"
        :src="getRankIcon(props.presence.competitiveTier)"
      />
      <span
        v-if="props.presence.competitiveTier > 20"
        :style="'color: #' + getRankColor(props.presence.competitiveTier)"
      >
        #{{ props.presence.leaderboardPosition }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getRankColor, getRankIcon } from "@/ts/valorant-api";
import Document from "@icons/Document.vue";
import ValorantPresence from "@interfaces/ValorantPresence";
import ValorantFriend from "@interfaces/ValorantFriend";

const props = defineProps<{
  friend: ValorantFriend;
  presence: ValorantPresence;
}>();
</script>

<style lang="scss" scoped>
span {
  display: inline-block;
  max-width: 100%;
  overflow-wrap: break-word;
  word-wrap: break-word;
}
.user-list-item-overlay {
  @extend .flex;
  justify-content: space-between;

  position: absolute;
  z-index: 10;
  top: 3.75rem;
  left: 0.125rem;
  right: 0.125rem;
  padding: 0.5rem 1rem;

  background: $background-dark-accent;
  border-radius: 0.25rem;
  pointer-events: none;
}

.user-list-item-rank-icon {
  min-width: 40px;
  height: 2.5rem;
  width: 2.5rem;
  margin-left: 0.25rem;
}

.user-list-item-sub-col {
  @extend .flex-col;
  justify-content: center;
  align-items: start;
  text-align: left;
}

.user-list-item-overlay-note {
  @extend .flex;
  @extend .text-sm;
}

.user-list-item-overlay-note svg {
  padding-right: 0.5rem;
}
</style>

<style lang="scss">
.user-list-item-button {
  & + .user-list-item-overlay {
    opacity: 0;
    transition-property: opacity;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
  &:hover + .user-list-item-overlay {
    opacity: 100;
    transition-property: opacity;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
}
</style>
