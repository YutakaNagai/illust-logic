<script setup>
import { onMounted, ref, watch } from "vue";
const btn_str = ref("ログイン");

onMounted(() => {
  window.addEventListener("watch-ls-uuid", (event) => {
    btn_str.value = event.detail === "guest" ? "ログイン" : "ログアウト";
    console.log("btn_str.value :>> ", btn_str.value);
  });
});
</script>

<template>
  <div class="header">
    <div><h2 class="title">イラストロジック</h2></div>
    <div class="header_btn_wrapper">
      <div>
        <img
          v-if="btn_str === 'ログイン'"
          id="header_login_btn"
          class="header_login_btn_img"
          src="../assets/login.png"
        />
        <img
          v-else
          id="header_logout_btn"
          class="header_login_btn_img"
          src="../assets/logout.png"
        />
        <div class="header_login_btn_text">{{ btn_str }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.title {
  margin-block: 0;
  margin-top: 20px;
  margin-bottom: 20px;
}
.header {
  position: relative;
  width: 90%;
  height: 80px;
  display: flex;
  justify-content: space-between;
  vertical-align: middle;
  margin: 0 auto;
}
.header_btn_wrapper {
  margin: 5px 0;
  height: 100%;
}
.header_login_btn_img {
  height: 50px;
}
.header_login_btn_text {
  font-size: small;
}
</style>
