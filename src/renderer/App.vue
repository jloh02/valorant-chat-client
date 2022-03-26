<template>
  <router-view />
</template>

<style lang="postcss">
#app {
  font-family: "Segoe UI", Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  @apply bg-stone-800 text-white 
  text-center text-base 
  h-screen w-screen
  min-h-screen max-h-screen;
}

*:focus {
  outline: none;
}

* {
  -webkit-user-select: none;
}

input {
  -webkit-user-select: text;
}

::selection {
  @apply bg-stone-400;
}

svg {
  display: inline-block;
  height: 1em;
  overflow: visible;
  vertical-align: -0.125em;
  overflow: visible;
  box-sizing: content-box;
}
</style>
