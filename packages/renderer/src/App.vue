<template>
  <router-view />
</template>

<style lang="scss">
body {
  font-family: "Segoe UI", Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  position: absolute;
  width: 100vw;
  min-width: 100vw;
  height: 100vh;
  min-height: 100vh;
}
button {
  border: none;
  border-radius: 0.25rem;
  color: white;
}
*:focus {
  outline: none;
}
* {
  user-select: none;
  position: relative;
}
input {
  user-select: text;
}
::selection {
  background-color: $background-accent;
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

<style lang="scss" scoped>
#app {
  @extend .text;

  background-color: $background-col;
  color: white;
  text-align: center;
}
</style>
