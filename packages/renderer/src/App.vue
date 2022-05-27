<template>
  <router-view />
</template>

<style lang="scss">
#app {
  @extend .text;
  @extend .max-size;
  background-color: $background-col;
  color: white;
  text-align: center;
}

body {
  position: absolute;
  margin: 0;
  width: 100vw;
  height: 100vh;
  min-width: 100vw;
  min-height: 100vh;

  color: white;

  button {
    border: none;
    border-radius: 0.25rem;
    color: white;
  }
  *:focus {
    outline: none;
  }
  * {
    font-family: "Segoe UI", Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    user-select: none;
    position: relative;
  }
  input {
    @extend .text;
    user-select: text;
    border: none;
    color: white;
  }
  ::selection {
    background-color: $background-accent;
  }
  svg {
    display: inline-block;
    height: 1em;
    vertical-align: -0.125em;
    box-sizing: content-box;
    overflow: visible;
  }
  p {
    margin: 0;
    padding: 0;
  }

  ul::-webkit-scrollbar {
    width: 0.25rem;
  }
  ul::-webkit-scrollbar-track {
    box-shadow: inset 0 0 0 transparent;
  }
  ul::-webkit-scrollbar-thumb {
    background-color: transparent;
    outline: none;
    border-radius: 0.125rem;
  }
  ul:hover::-webkit-scrollbar-thumb {
    background-color: $background-lighter;
    transition-property: background-color;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 150ms;
  }
}
</style>
