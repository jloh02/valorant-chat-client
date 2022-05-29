<template>
  <party-invite-dialog ref="dialog" />
  <div
    class="user-list-ctx-menu"
    ref="contextMenu"
    @mouseleave="hideContextMenu"
  >
    <div class="user-list-ctx-menu-inner">
      <button class="user-list-ctx-menu-item" @click="inviteToParty">
        <invite />
        Invite
      </button>
      <button class="user-list-ctx-menu-item" @click="joinParty">
        <request-join />
        Join Party
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import Invite from "@icons/Invite.vue";
import RequestJoin from "@/icons/RequestJoin.vue";
import PartyInviteDialog from "./PartyInviteDialog.vue";

const contextMenu = ref<InstanceType<typeof HTMLElement>>();
function hideContextMenu() {
  const el: HTMLElement | undefined = contextMenu.value;
  if (el) {
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
  }
}

const puuid = ref("");
const name = ref("");
const tag = ref("");
const partyId = ref("");
function setPosition(
  x: number,
  y: number,
  newPuuid: string,
  newPartyId: string,
  newName: string,
  newTag: string
) {
  puuid.value = newPuuid;
  partyId.value = newPartyId;
  name.value = newName;
  tag.value = newTag;

  const el: HTMLElement | undefined = contextMenu.value;
  if (el) {
    if (x + el.clientWidth > window.innerWidth)
      x = window.innerWidth - el.clientWidth;
    if (y + el.clientWidth > window.innerHeight)
      y = window.innerHeight - el.clientHeight;

    x -= 5;
    y -= 5;

    el.style.top = y + "px";
    el.style.left = x + "px";
    el.style.opacity = "100";
    el.style.pointerEvents = "auto";
  }
}

const dialog = ref<InstanceType<typeof PartyInviteDialog>>();
function showDialog(msg: string) {
  dialog.value?.show(msg);
}

function inviteToParty() {
  /* 
  Returns:
  0 - Failed
  1 - Invited
  2 - Already in Party
  */
  window.ipc
    ?.invoke("VALORANT_PARTY", "INVITE", name.value, tag.value)
    .then((res) => {
      if (res == 0)
        showDialog("Invite Failed\nCheck that the VALORANT game is open");
      else if (res == 1) showDialog("Invite Successful");
      else if (res == 2) showDialog("Invite Failed\nAlready in party");
    });
  hideContextMenu();
}

function joinParty() {
  /* 
  Returns:
  0 - Failed
  1 - Accepted Invite
  2 - Requested to Join 
  */
  window.ipc
    ?.invoke("VALORANT_PARTY", "JOIN", partyId.value, puuid.value)
    .then((res) => {
      switch (res) {
        case 0:
          showDialog("Request Failed\nCheck that the VALORANT game is open");
          break;
        case 1:
          showDialog("Invite to Party Accepted");
          break;
        case 2:
          showDialog("Requested to Join Party");
          break;
      }
    });
  hideContextMenu();
}

defineExpose({ setPosition });
</script>

<style lang="scss" scoped>
.user-list-ctx-menu {
  @extend .shadow;
  position: fixed;
  border-radius: 0.25rem;
  z-index: 50;
  opacity: 0;
  background-color: $background-lighter-2;

  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.user-list-ctx-menu-item {
  @extend .flex;
  @extend .text-sm;
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 0.75rem;
  background-color: $background-lighter-2;
}
.user-list-ctx-menu-item:first-child {
  border-radius: 0.25rem 0.25rem 0 0;
}
.user-list-ctx-menu-item:last-child {
  border-radius: 0 0 0.25rem 0.25rem;
}
.user-list-ctx-menu-item:hover {
  background-color: #78716c;
}

.user-list-ctx-menu-item svg {
  fill: white;
  padding-right: 1rem;
  width: 1rem;
}
</style>
