<script setup>
import { ref } from "vue";
import ChoicePuzzle from "./components/ChoicePuzzle.vue";
import CreatePuzzle from "./components/CreatePuzzle.vue";
import LoginModal from "./components/LoginModal.vue";
import Header from "./components/Header.vue";

const page = ref(1);
</script>

<template>
  <div class="outer">
    <Header />
    <ChoicePuzzle v-if="page === 1" />
    <CreatePuzzle v-else-if="page === 2" />
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
</style>
