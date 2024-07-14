<script setup>
import CreatePuzzle from "./components/CreatePuzzle.vue";
import LoginModal from "./components/LoginModal.vue";
import Header from "./components/Header.vue";
</script>

<template>
  <div class="outer">
    <div class="header_wrapper">
      <Header />
    </div>
    <div class="main">
      <CreatePuzzle />
    </div>
    <LoginModal />
  </div>
</template>

<style scoped>
.outer {
  width: 100%;
  height: 100%;
  background: url("assets/bg.jpg");
  background-size: cover;
}
.header_wrapper {
  width: 100%;
  height: 80px;
  background-color: rgba(196, 196, 196, 0.7);
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.5),
    inset 0px -3px 6px -2px rgba(0, 0, 0, 0.3);
}
.main {
  position: relative;
  width: 100vw;
  height: calc(100vh - 80px);
  display: flex;
  flex-flow: column;
  justify-content: center;
}
</style>
