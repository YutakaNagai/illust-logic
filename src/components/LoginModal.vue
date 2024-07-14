<script setup>
import { onMounted, ref, watch } from "vue";
import { supabase } from "../supabase";

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
    login_modal_wrapper.value.focus();
    login_modal_wrapper.value.style.display = "block";
    login_modal_wrapper.value.classList.add("modal_fade_in");
  }
});

const chgStatus = (status) => {
  login_modal_status.value = status;
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
  } else {
    // 重複チェック
    const chk_id_res = await supabase.from("user").select().eq("id", id.value);
    if (chk_id_res.status === 201 && !chk_id_res.error) {
      error_list.push({
        error: "signup_id",
        msg: "このユーザーIDは登録できません。",
      });
    }
    const chk_name_res = await supabase
      .from("user")
      .select()
      .eq("id", username.value);
    if (chk_name_res.status === 201 && !chk_name_res.error) {
      error_list.push({
        error: "signup_username",
        msg: "このユーザー名は登録できません。",
      });
    }
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
    };
    const res = await supabase.from("users").insert([record]);
    if (res.status === 201 && !res.error) {
      console.group("下記のレコードをDBに登録しました。");
      console.table(record);
      console.groupEnd();

      localStorage.setItem("uuid", uuid);
      location.reload();
    }
  }
};

const login = async () => {
  error_list = [];

  const res = await supabase
    .from("users")
    .select("uuid")
    .eq("id", id.value)
    .eq("password", password.value)
    .limit(1);
  const is_login = res.status === 200 && !res.error && res.data.length === 1;

  if (is_login) {
    localStorage.setItem("uuid", res.data[0].uuid);
    hideModal();
  } else {
    error_list.push({
      error: "sign_in",
      msg: "IDもしくはパスワードが誤っています。",
    });
    displayError();
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
    console.log("error_target :>> ", error_target);
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
          <div class="modal_input_area_item">
            <span>ユーザーID: </span><input type="text" v-model="id" />
            <div id="sign_in" class="modal_input_area_error">
              {{ error_msg }}
            </div>
          </div>
          <div class="modal_input_area_item">
            <span>パスワード: </span><input type="text" v-model="password" />
          </div>
          <div class="modal_input_area_item">
            <button @click="login()">ログイン</button>
          </div>
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
              <span>パスワード: </span><input type="text" v-model="password" />
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
              <span>ユーザー名: </span><input type="text" v-model="username" />
            </div>
            <div class="modal_input_area_subtext">
              <span>※ パズル作成時など、他ユーザに公開されます。</span>
            </div>
            <div id="signup_username" class="modal_input_area_error">
              {{ error_msg }}
            </div>
          </div>
          <div><button @click="signup()">新規登録</button></div>
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
