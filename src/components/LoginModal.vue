<script setup>
import { onMounted, ref, watch } from "vue";
import { supabase } from "../supabase";
import { watchStorage } from "../util.js";

const login_modal_wrapper = ref(null);
const login_modal_status = ref("login");
const id = ref("");
const password = ref("");
const username = ref("");
const error_msg = ref("");
onMounted(async () => {
  // ログイン状態の取得
  const uuid = localStorage.getItem("uuid");
  const res = await supabase.from("users").select().eq("uuid", uuid).limit(1);
  const is_login = res.status === 200 && !res.error && res.data.length === 1;

  // 未ログインの場合モーダルを表示
  if (!is_login) {
    showModal();
  }

  // Header.vueのボタン押下を監視
  window.addEventListener("click", (event) => {
    console.log("event.target.id :>> ", event.target.id);
    if (
      event.target.id === "header_login_btn" ||
      event.target.id === "header_logout_btn"
    ) {
      localStorage.removeItem("uuid");
      showModal();
    }
  });
});

const chgStatus = (status) => {
  if (status === "guest") {
    localStorage.setItem("uuid", "guest");
    watchStorage("watch-ls-uuid", "ls", "uuid");
    hideModal();
  } else {
    login_modal_status.value = status;
  }
};

let error_list = [];
const signup = async () => {
  error_list = [];
  // 空文字バリデーション
  if (!id.value || !id.value.match(/\S/g)) {
    error_list.push({
      error: "signup_id",
      msg: "ユーザーIDが入力されていません。",
    });
  } else if (id.value.includes("guest")) {
    error_list.push({
      error: "signup_id",
      msg: "このユーザーIDは登録できません。",
    });
  }
  if (!password.value || !password.value.match(/\S/g)) {
    error_list.push({
      error: "signup_password",
      msg: "パスワードが入力されていません。",
    });
  }
  if (!username.value || !username.value.match(/\S/g)) {
    error_list.push({
      error: "signup_username",
      msg: "ユーザー名が入力されていません。",
    });
  } else if (
    username.value.includes("ゲスト") ||
    username.value.includes("管理")
  ) {
    error_list.push({
      error: "signup_username",
      msg: "このユーザー名は登録できません。",
    });
  }

  if (error_list.length > 0) {
    displayError();
  } else {
    const now = Date.now();
    const uuid = `${id.value}${now}`;
    const record = {
      id: id.value,
      password: password.value,
      name: username.value,
      uuid,
      fail_login: 0,
    };
    const res = await supabase.from("users").insert([record]);
    if (res.status === 201 && !res.error) {
      console.group("下記のレコードをDBに登録しました。");
      console.table(record);
      console.groupEnd();

      localStorage.setItem("uuid", uuid);
      watchStorage("watch-ls-uuid", "ls", "uuid");
      hideModal();
    } else {
      const cause_of_error = /^Key \((.*)\)=\(.*\) already exists.$/.exec(
        res.error.details
      )[1];

      if (cause_of_error === "id") {
        error_list.push({
          error: "signup_id",
          msg: "このユーザーIDは登録できません。",
        });
      } else if (cause_of_error === "name") {
        error_list.push({
          error: "signup_username",
          msg: "このユーザー名は登録できません。",
        });
      } else {
        error_list.push({
          error: "signup_id",
          msg: "原因不明のエラーが発生しました。",
        });
      }
      displayError();
    }
  }
};

const login = async () => {
  error_list = [];

  const user_res = await supabase
    .from("users")
    .select()
    .eq("id", id.value)
    .limit(1);

  if (
    user_res.status === 200 &&
    !user_res.error &&
    user_res.data.length === 1
  ) {
    const user_info = user_res.data[0];
    if (user_info.fail_login < 3) {
      if (user_info.password === password.value) {
        // ログインに成功した場合、ログイン連続失敗回数をリセット
        await supabase
          .from("users")
          .update({ fail_login: 0 })
          .eq("id", id.value);
        localStorage.setItem("uuid", user_info.uuid);
        watchStorage("watch-ls-uuid", "ls", "uuid");
        hideModal();
      } else {
        // パスワードが異なる場合、ログイン連続失敗回数を加算
        await supabase
          .from("users")
          .update({ fail_login: user_info.fail_login + 1 })
          .eq("id", id.value);
        error_list.push({
          error: "sign_in",
          msg: "パスワードが誤っています。",
        });
        displayError();
      }
    } else {
      // ログイン失敗回数が３回以上の場合
      error_list.push({
        error: "sign_in",
        msg: "アカウントはロックされています。",
      });
      displayError();
    }
  } else {
    // IDが異なる場合
    error_list.push({
      error: "sign_in",
      msg: "登録されていないユーザーIDです。",
    });
    displayError();
  }
};

const showModal = () => {
  login_modal_wrapper.value.focus();
  login_modal_wrapper.value.style.display = "block";
  login_modal_wrapper.value.classList.add("modal_fade_in");
  if (login_modal_wrapper.value.classList.contains("modal_fade_out")) {
    login_modal_wrapper.value.classList.remove("modal_fade_out");
  }
};

const hideModal = () => {
  login_modal_wrapper.value.style.display = "none";
  login_modal_wrapper.value.classList.add("modal_fade_out");
  login_modal_wrapper.value.classList.remove("modal_fade_in");
};

const displayError = () => {
  const error_elements = Array.from(
    document.getElementsByClassName("modal_input_area_error")
  );
  error_elements.forEach((elem) => {
    elem.style.display = "none";
  });
  error_list.forEach((errorInfo) => {
    const error_target = document.getElementById(errorInfo.error);
    error_target.style.display = "block";
    error_target.textContent = errorInfo.msg;
  });
};
</script>
<template>
  <div ref="login_modal_wrapper" class="modal_wrapper">
    <div class="modal_dialog">
      <template v-if="login_modal_status === 'login'">
        <div class="modal_title">ログインしてください</div>
        <div class="modal_input_area">
          <form>
            <div class="modal_input_area_item">
              <span>ユーザーID: </span
              ><input type="text" v-model="id" autocomplete="on" />
              <div id="sign_in" class="modal_input_area_error">
                {{ error_msg }}
              </div>
            </div>
            <div class="modal_input_area_item">
              <span>パスワード: </span
              ><input type="password" v-model="password" autocomplete="on" />
            </div>
            <div class="modal_input_area_item">
              <button type="button" @click="login()">ログイン</button>
            </div>
          </form>
          <!-- <div>
            <button @click="chgStatus('forgot')">パスワードを忘れた場合</button>
          </div> -->
        </div>
        <div>
          <button @click="chgStatus('signup')">新規登録</button>
          <button @click="chgStatus('guest')">ログインせずに使う</button>
        </div>
      </template>

      <template v-if="login_modal_status === 'signup'">
        <div class="modal_title">新規登録</div>
        <div class="modal_input_area">
          <form>
            <div class="modal_input_area_item">
              <div>
                <span>ユーザーID: </span><input type="text" v-model="id" />
              </div>
              <div class="modal_input_area_subtext">
                <span
                  >※
                  ログインにのみ利用され、他のユーザーへは公開されません。</span
                >
              </div>
              <div id="signup_id" class="modal_input_area_error">
                {{ error_msg }}
              </div>
            </div>
            <div class="modal_input_area_item">
              <div>
                <span>パスワード: </span
                ><input type="text" v-model="password" />
              </div>
              <div class="modal_input_area_subtext">
                <span>※ 推測されにくいものを設定してください。</span>
              </div>
              <div id="signup_password" class="modal_input_area_error">
                {{ error_msg }}
              </div>
            </div>
            <div class="modal_input_area_item">
              <div>
                <span>ユーザー名: </span
                ><input type="text" v-model="username" />
              </div>
              <div class="modal_input_area_subtext">
                <span>※ パズル作成時など、他ユーザに公開されます。</span>
              </div>
              <div id="signup_username" class="modal_input_area_error">
                {{ error_msg }}
              </div>
            </div>
            <div><button type="button" @click="signup()">新規登録</button></div>
          </form>
        </div>
        <div>
          <button @click="chgStatus('login')">ログイン</button>
          <button @click="chgStatus('guest')">ログインせずに使う</button>
        </div>
      </template>
    </div>
  </div>
</template>
<style scoped>
.modal_wrapper {
  position: absolute;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  display: none;
}
.modal_fade_in {
  animation: modal_fade_in forwards 0.5s linear;
}
@keyframes modal_fade_in {
  from {
    display: none;
    background-color: rgba(0, 0, 0, 0);
  }
  to {
    display: block;
    background-color: rgba(0, 0, 0, 0.3);
  }
}
.modal_fade_out {
  animation: modal_fade_out forwards 0.5s linear;
}
@keyframes modal_fade_out {
  from {
    display: block;
    background-color: rgba(0, 0, 0, 0.3);
    opacity: 1;
  }
  to {
    display: none;
    background-color: rgba(0, 0, 0, 0);
    opacity: 0;
  }
}
.modal_dialog {
  position: absolute;
  width: 90%;
  height: 50%;
  left: 5%;
  top: 25%;
  background: white;
  border-radius: 30px;
  display: flex;
  flex-flow: column;
  justify-content: space-between;
  padding: 20px 0;
}
.modal_input_area {
  display: flex;
  flex-flow: column;
  justify-content: space-evenly;
}
.modal_input_area_item {
  position: relative;
  padding-bottom: 2rem;
}
.modal_input_area_subtext {
  text-align: right;
  font-size: 0.7rem;
}
.modal_input_area_error {
  position: absolute;
  top: -1.5rem;
  width: 100%;
  color: red;
  font-weight: bold;
}
</style>
