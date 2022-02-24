<template>
  <li :class="getMessageStyle">
    <div>
      <p>{{ this.message }}</p>
    </div>
  </li>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ChatMessage",
  props: ["outgoing", "message"],
  computed: {
    getMessageStyle() {
      return this.outgoing
        ? "chat-dashboard msg msg-outgoing"
        : "chat-dashboard msg msg-incoming";
    },
  },
});
</script>

<style lang="postcss">
.chat-dashboard.msg {
  @apply flex text-justify;
}
.msg-outgoing {
  margin-left: 25%;
  @apply justify-end;
}
.msg-incoming {
  margin-right: 25%;
  @apply justify-start;
}

.chat-dashboard.msg div {
  @apply p-3 m-1 rounded;
}
.msg-outgoing div {
  @apply bg-stone-700;
}
.msg-incoming div {
  @apply bg-stone-900;
}
</style>
