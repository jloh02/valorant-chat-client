<template>
  <li v-if="props.insertDay" class="chat-day">
    <div>
      <p>{{ date }}</p>
    </div>
  </li>
  <li
    :class="props.outgoing ? 'chat-message outgoing' : 'chat-message incoming'"
  >
    <div>
      <p class="message-text">{{ props.message }}</p>
      <p class="timestamp">{{ time }}</p>
    </div>
  </li>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{
  insertDay: boolean;
  outgoing: boolean;
  message: string;
  datetime: Date;
}>();

const date = computed(() => {
  const dtStr = props.datetime.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });
  return `${dtStr}`;
});

const time = computed(() => {
  const dtStr = props.datetime.toTimeString().split(":");
  return `${dtStr[0]}:${dtStr[1]}`;
});
</script>

<style lang="scss" scoped>
.chat-day {
  @extend .center;
  width: 100%;
  text-align: center;
  margin: 1rem 0;

  div {
    @extend .text-sm;
    color: #888888;
    background-color: #110f0f;
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 0.25rem;
  }
}

.chat-message {
  @extend .flex;
  height: min-content;
  width: 75%;
  text-align: justify;

  div {
    margin: 0.25rem;
    border-radius: 0.25rem;

    p.message-text {
      padding: 0.5rem 1.5rem 0 0.75rem;
    }
    p.timestamp {
      font-size: 0.6rem;
      line-height: 0.75rem;
      color: #888888;
      text-align: right;
      padding: 0 0.5rem 0.25rem 0;
    }
  }
}
.outgoing {
  margin-left: 25%;
  justify-content: flex-end;

  div {
    background-color: $background-lighter;
  }
}
.incoming {
  margin-right: 25%;
  justify-content: flex-start;

  div {
    background-color: $background-dark-accent;
  }
}
</style>
