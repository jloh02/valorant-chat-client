<template>
  <div class="chat-messages-view">
    <ul class="chat-messages-view-messages">
      <chat-message
        v-for="[idx, msg] of messages.entries()"
        :key="idx"
        :insertDay="
          idx == 0 ||
          msg.datetime.getDate() !== messages[idx - 1].datetime.getDate()
        "
        :outgoing="msg.outgoing"
        :message="msg.message"
        :datetime="msg.datetime"
      />
      <div ref="chatMessagesViewLast" id="chat-messages-view-last" />
    </ul>
    <div class="chat-messages-view-input">
      <div class="chat-messages-view-input-label">
        <p>{{ inputLabel }}</p>
      </div>
      <input
        id="text-msg-input"
        type="text"
        placeholder="Enter message here"
        v-model="messageField"
        @keyup.enter="sendMessage"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick } from "vue";
import ChatMessage from "./ChatMessage.vue";
import { ValorantSimpleMessage } from "@interfaces/ValorantMessage";

const props = defineProps<{
  inputLabel: string;
  pid: string;
  messages: ValorantSimpleMessage[];
}>();

const messageField = ref("");
function sendMessage() {
  window.ipc?.invoke("VALORANT_CHAT", "SEND", props.pid, messageField.value);
  messageField.value = "";
}

const chatMessagesViewLast = ref<InstanceType<typeof HTMLElement>>();
function scrollLastMessage(smooth: boolean) {
  nextTick().finally(() => {
    const el: HTMLElement = chatMessagesViewLast.value as HTMLElement;
    if (el)
      el.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
  });
}
defineExpose({ scrollLastMessage });
</script>

<style lang="scss" scoped>
.chat-messages-view {
  @extend .flex-col;
  flex: 1 1 0%;
  justify-content: flex-end;
  padding: 0.5rem;
  box-sizing: border-box;
  overflow-wrap: anywhere;
}
.chat-messages-view-messages {
  display: flex;
  flex-direction: column;
  margin: 0;
  overflow-y: scroll;
  padding-left: 0;
  padding-right: 0.75rem;
  width: 100%;
  height: 100%;
  :first-child {
    margin-top: auto;
  }
}
.chat-messages-view-input {
  @extend .flex;
  width: 100%;
  margin: 0.25rem;
  border-radius: 0.25rem;
  background-color: $background-lighter-2;

  input {
    background-color: transparent;
    width: 100%;
    margin: 0;
    padding: 0.25rem 0.75rem;

    :active {
      border: none;
    }
  }
}
.chat-messages-view-input-label {
  @extend .text;
  background-color: $background-lighter;
  text-align: start;
  min-width: fit-content;
  width: 20%;
  margin: 0;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem 0 0 0.25rem;
  white-space: nowrap;
  cursor: default;
}
</style>
