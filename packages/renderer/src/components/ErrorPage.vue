<template>
  <div class="error-page">
    <div class="loader">
      <svg class="circular" viewBox="25 25 50 50">
        <circle
          class="path"
          cx="50"
          cy="50"
          r="20"
          fill="none"
          stroke-width="2"
          stroke-miterlimit="10"
        />
      </svg>
    </div>
    <p>
      Riot Client Closed<br />
      Waiting for Response...
    </p>
    <button class="open-riot-client-button" @click="openRiotClient">
      Open Riot Client
    </button>
  </div>
</template>

<script lang="ts" setup>
function openRiotClient() {
  window.ipc?.send("WINDOW", "OPEN_RIOT_CLIENT");
}
</script>

<style lang="scss" scoped>
/* Taken from https://www.cssscript.com/animated-google-loader-with-svg-and-css/ */
.error-page {
  @extend .flex-col;
  justify-content: center;
}

.loader {
  position: relative;
  margin: 12px auto;
  height: 48px;
  width: 48px;

  :before {
    content: "";
    display: block;
    padding-top: 100%;
  }
}

.circular {
  animation: rotate 2s linear infinite;
  height: 100%;
  transform-origin: center center;
  width: 100%;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  stroke: $valo-red;
}
.path {
  stroke-dasharray: 1, 200;
  stroke-dashoffset: 0;
  animation: dash 1.5s ease-in-out infinite, color 6s ease-in-out infinite;
  stroke-linecap: round;
}
@keyframes rotate {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124;
  }
}
.open-riot-client-button {
  @extend .valo-red-theme;
  margin-top: 0.5rem;
  padding: 0.5rem;
}
</style>
