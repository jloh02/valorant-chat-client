<template>
  <div class="chat-list-party">
    <div>
      <font-awesome-icon icon="users" />
      <p>{{ this.partyCount == 1 ? "SOLO" : this.partyCount }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ChatListPartyEntry",
  props: ["partyCount"],
});
</script>

<style lang="postcss">
.chat-list-party {
  @apply w-full h-7 rounded-full border-white border-b-2 -translate-y-1/4
  flex justify-center items-end;
}

.chat-list-party div {
  @apply flex flex-row justify-center items-center h-2/3 w-full pb-1;
}

.chat-list-party svg {
  @apply h-full w-auto py-2 pr-2;
}

.chat-list-party p {
  @apply cursor-default;
}
</style>
