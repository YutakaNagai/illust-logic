<script setup>
import { onMounted, ref, watch } from "vue";
import { supabase } from "../supabase";
import PuzzleImg from "./PuzzleImg.vue";

const dot_field = ref([]);
const size = ref(Number(sessionStorage.getItem("size")) || 10);
for (let i = 0; i < size.value; i++) {
  dot_field.value.push(Array(size.value).fill(false));
}

const title = ref("");
const description = ref("");

const msg_list = ref([]);

const paint_mode = ref("auto");

// テンプレート参照
const title_textarea = ref(null);
const description_textarea = ref(null);
const sticky = ref(null);
const illust_field = ref(null);
const modal = ref(null);

onMounted(() => {
  title_textarea.value.focus();
  description_textarea.value.focus();
  illust_field.value.focus();
  modal.value.focus();

  // スマホスクロール無効化
  const handleTouchMove = (e) => {
    e.preventDefault();
  };
  document.addEventListener("touchmove", handleTouchMove, { passive: false });

  let move_action = "paint";
  illust_field.value.ontouchstart = (event) => {
    console.log("touch start");
    if (paint_mode.value === "auto") {
      // タッチ開始時点のセルが黒なら黒→白、白なら白→黒
      move_action = event.touches[0].target.classList.contains("painted")
        ? "erase"
        : "paint";
    } else {
      move_action = paint_mode.value;
    }
    const coordinate = event.touches[0].target.id.split("_");
    if (move_action === "erase") {
      event.touches[0].target.classList.remove("painted");
      dot_field.value[coordinate[0]][coordinate[1]] = false;
    } else {
      event.touches[0].target.classList.add("painted");
      dot_field.value[coordinate[0]][coordinate[1]] = true;
    }
  };
  illust_field.value.ontouchmove = (event) => {
    // 画面のスクロールを防止する
    const touch = event.touches[0];
    const slide_target = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    );
    if (slide_target && slide_target.classList.contains("cell")) {
      const coordinate = slide_target.id.split("_");
      if (move_action === "paint") {
        slide_target.classList.add("painted");
        dot_field.value[coordinate[0]][coordinate[1]] = true;
      } else {
        slide_target.classList.remove("painted");
        dot_field.value[coordinate[0]][coordinate[1]] = false;
      }
    }
  };
});

let col;
let row;

const validate = () => {
  msg_list.value = [];
  sticky.value.classList.remove("sticky_slidein");
  let is_error = false;
  // バリデーション
  if (!title.value || !title.value.match(/\S/g)) {
    displaySticky("title", "エラー: タイトルが未設定です。");
    is_error = true;
  }
  if (!description.value || !description.value.match(/\S/g)) {
    displaySticky("description", "エラー: 詳細が未設定です。");
    is_error = true;
  }
  if (!is_error) {
    // エラーチェック用
    let is_blank = true;

    // ヒント作成用関数
    const createHint = (arr) => {
      let hint = "";
      let answer = "";

      arr.forEach((child_arr, c_index) => {
        let num_count = 0;
        child_arr.forEach((cell, index) => {
          if (cell) {
            is_blank = false;
            answer += "1,";
            // 塗られていたらカウントをインクリメント
            num_count++;
            if (index + 1 === child_arr.length) {
              // 列末尾の場合、カウントをプッシュ
              hint += num_count;
              num_count = 0;
            }
          } else {
            answer += "0,";
            if (num_count > 0) {
              // 塗られていない場合、カウントがたまっていればプッシュ
              hint +=
                index + 1 === child_arr.length ? num_count : `${num_count},`;
              num_count = 0;
            }
          }
        });

        answer = answer.slice(0, -1);
        if (hint.endsWith(",")) {
          hint = hint.slice(0, -1);
        }
        // 一行（列）分終わったら区切り記号としてスラッシュを置く
        if (c_index + 1 !== arr.length) {
          hint += "/";
          answer += "/";
        }
      });
      return { hint, answer };
    };

    // 垂直方向のヒント作成
    col = createHint(dot_field.value);

    // 二次元配列を転置
    const transpose_array = dot_field.value[0].map((_, c) =>
      dot_field.value.map((r) => r[c])
    );

    // 水平方向のヒント作成
    row = createHint(transpose_array);

    if (is_blank) {
      displaySticky("dot_field", "エラー: 作図が行われていません。");
      is_error = true;
    } else {
      showModal();
    }
  }
};

const saveIllust = async () => {
  const record = {
    title: title.value,
    description: description.value,
    creator_id: "0",
    creator_name: "テストユーザー",
    col_answer: col.answer,
    col_hint: col.hint,
    row_answer: row.answer,
    row_hint: row.hint,
    num_of_col: dot_field.value.length,
    num_of_row: dot_field.value[0].length,
    challenged: 0,
    solved: 0,
    good: 0,
    bad: 0,
    is_deleted: false,
  };
  const res = await addPuzzle(record);
  console.log("res :>> ", res);

  if (res.status === 201 && !res.error) {
    console.group("下記のレコードをDBに登録しました。");
    console.table(record);
    console.groupEnd();
    hideModal();
    displaySticky("saved", "作成したパズルを保存しました！");
  } else {
    hideModal();
    displaySticky("other", "エラー: 通信環境を確認し、再度保存してください");
  }
};

const addPuzzle = async (record) => {
  return await supabase.from("illust_logic").insert([record]);
};

const initIllust = () => {
  dot_field.value.forEach((col, c_index) => {
    col.forEach((cell, r_index) => {
      dot_field.value[c_index][r_index] = false;
    });
  });
  const elemList = Array.from(document.getElementsByClassName("cell"));
  elemList.forEach((cell) => {
    if (cell.classList.contains("painted")) {
      cell.classList.remove("painted");
    }
  });
};

const chgFieldSize = (size) => {
  sessionStorage.setItem("size", size);
  location.reload();
  // const elemList = Array.from(document.getElementsByClassName("cell"));
  // elemList.forEach((cell) => {
  //   console.log("cell :>> ", cell);
  //   if (cell.classList.contains("painted")) {
  //     console.log("cell.classList :>> ", cell.classList);
  //     cell.classList.remove("painted");
  //     const coordinate = cell.id.split("_");
  //     dot_field.value[coordinate[0]][coordinate[1]] = false;
  //   }
  // });
  // dot_field.value = [];
  // const promiseList = [];
  // for (let i = 0; i < size; i++) {
  //   promiseList.push(dot_field.value.push(Array(size).fill(false)));
  // }
  // Promise.all(promiseList).then(() => {
  //   const elemListAfter = Array.from(document.getElementsByClassName("cell"));
  //   // document.innerWidth;
  //   console.log("window.innerWidth :>> ", window.innerWidth);
  //   const max_size = (window.innerWidth * 0.8) / size;
  //   console.log("dot_field.value :>> ", dot_field.value);
  //   console.log("elemListAfter :>> ", elemListAfter);
  //   elemListAfter.forEach((cell) => {
  //     cell.classList.add("mini");
  //     cell.style.width = `${max_size}px`;
  //     cell.style.height = `${max_size}px`;
  //   });
  // });
};

let is_show_border = true;
const hideBorder = () => {
  const elemList = Array.from(document.getElementsByClassName("cell"));
  if (is_show_border) {
    elemList.forEach((cell) => {
      cell.classList.remove("--border");
    });
    is_show_border = false;
  } else {
    elemList.forEach((cell) => {
      cell.classList.add("--border");
    });
    is_show_border = true;
  }
};

const displaySticky = (type, msg) => {
  if (sticky.value.classList.contains("--error")) {
    sticky.value.classList.remove("--error");
  }
  if (sticky.value.classList.contains("--save")) {
    sticky.value.classList.remove("--save");
  }

  if (type === "title") {
    title_textarea.value.classList.add("error_bg");
    msg_list.value.push(msg);
    sticky.value.classList.add("--error");
  }
  if (type === "description") {
    description_textarea.value.classList.add("error_bg");
    msg_list.value.push(msg);
    sticky.value.classList.add("--error");
  }
  if (type === "dot_field" || type === "other") {
    msg_list.value.push(msg);
    sticky.value.classList.add("--error");
  }
  if (type === "saved") {
    msg_list.value.push(msg);
    sticky.value.classList.add("--save");
  }
  sticky.value.classList.add("sticky_slidein");
  setTimeout(() => {
    sticky.value.classList.remove("sticky_slidein");
  }, 2500);
};

const chgPaintMode = (mode) => {
  paint_mode.value = mode;
};

const showModal = () => {
  modal.value.style.display = "block";
  modal.value.classList.add("modal_animation");
};

const hideModal = () => {
  modal.value.classList.remove("modal_animation");
  modal.value.style.display = "none";
};
watch(title, () => {
  title_textarea.value.classList.remove("error_bg");
});

watch(description, () => {
  description_textarea.value.classList.remove("error_bg");
});
</script>

<template>
  <div>
    <div ref="modal" class="modal_wrapper" @click="hideModal()">
      <div class="modal_dialog">
        <div class="modal_text">以下のデータを保存します。</div>
        <div class="modal_img">
          <PuzzleImg :illust="dot_field" :cell-num="size" />
        </div>
        <div class="modal_others">
          <div class="input_set">
            <span>タイトル: </span>
            <span>{{ title }}</span>
          </div>
          <div class="input_set">
            <span>詳細: </span>
            <span>{{ description }}</span>
          </div>
        </div>
        <div class="modal_btn_area">
          <button @click="hideModal()">いいえ</button>
          <button @click="saveIllust()">はい</button>
        </div>
      </div>
    </div>
    <div ref="sticky" class="sticky">
      <div
        v-for="(msg, index) in msg_list"
        :key="`error_${index}`"
        class="sticky_msg"
      >
        {{ msg }}
      </div>
    </div>
    <div class="size_btn_area">
      <button @click="chgFieldSize(10)">10x10</button>
      <button @click="chgFieldSize(20)">20x20</button>
      <button @click="chgFieldSize(30)">30x30</button>
    </div>
    <div ref="illust_field" class="illust_field">
      <div
        v-for="(col, c_index) in dot_field"
        :key="`col_${c_index}`"
        class="col"
      >
        <div
          v-for="(row, r_index) in col"
          :key="`row_${r_index}`"
          :id="`${c_index}_${r_index}`"
          class="cell --border"
          :class="{
            '--large': size === 10,
            '--medium': size === 20,
            '--small': size === 30,
            '--thick_left': c_index % 5 === 0,
            '--thick_right': c_index === size - 1,
            '--thick_top': r_index % 5 === 0,
            '--thick_bottom': r_index === size - 1,
          }"
        ></div>
      </div>
    </div>

    <div class="input_area">
      <div class="input_set">
        <span>タイトル: </span>
        <input ref="title_textarea" type="text" v-model="title" />
      </div>
      <div class="input_set">
        <span>詳細: </span>
        <input ref="description_textarea" type="text" v-model="description" />
      </div>
    </div>

    <div class="btn_area">
      <button
        @click="chgPaintMode('auto')"
        :class="paint_mode === 'auto' ? '--active' : ''"
      >
        自動
      </button>
      <button
        @click="chgPaintMode('paint')"
        :class="paint_mode === 'paint' ? '--active' : ''"
      >
        鉛筆
      </button>
      <button
        @click="chgPaintMode('erase')"
        :class="paint_mode === 'erase' ? '--active' : ''"
      >
        消しゴム
      </button>
    </div>

    <div class="btn_area">
      <button @click="initIllust()">クリア</button>
      <button @click="hideBorder()">枠線</button>
      <button @click="validate()">保存</button>
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
.modal_animation {
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
.modal_dialog {
  position: absolute;
  width: 60%;
  height: 50%;
  left: 20%;
  top: 25%;
  background: white;
  border-radius: 30px;
  display: flex;
  flex-flow: column;
  justify-content: space-between;
  padding: 20px 0;
}
.modal_img {
  width: 90%;
  aspect-ratio: 1 / 1;
  margin: 0 auto;
}
.modal_others {
  margin: 10px;
  display: flex;
  flex-flow: column;
  justify-content: space-evenly;
}
.modal_btn_area {
  display: flex;
  justify-content: space-evenly;
}
.sticky {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  display: flex;
  flex-flow: column;
  text-align: left;
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.5),
    inset 0px -3px 6px -2px rgba(0, 0, 0, 0.3);
  transition: 1s cubic-bezier(0.23, 1, 0.32, 1);
  line-height: 2;
  transform: translateY(-100px);
}
.--error {
  background-color: #fcd4e0;
}
.--save {
  background-color: #bcf4f8;
}
.sticky_slidein {
  transform: none;
}
.sticky_msg {
  padding: 5px 0 5px 20px;
}

.size_btn_area {
  display: flex;
  justify-content: space-evenly;
}

.illust_field {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 25px auto 25px auto;
}
.cell {
  width: 20px;
  height: 20px;
  margin-bottom: -1px;
  margin-right: -1px;
  box-sizing: border-box;
}
.--border {
  border: 1px solid black;
}
.--thick_left {
  border-left-width: 3px;
}
.--thick_right {
  border-right-width: 3px;
}
.--thick_top {
  border-top-width: 3px;
}
.--thick_bottom {
  border-bottom-width: 3px;
}
.painted {
  background-color: rgb(104, 98, 98);
}
.input_area {
  margin: 25px;
  display: flex;
  flex-flow: column;
  justify-content: space-evenly;
}
.input_set {
  margin: 5px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.--active {
  background-color: darkgray;
}
.btn_area {
  display: flex;
  justify-content: space-evenly;
  margin: 5px auto;
}
.error_bg {
  background-color: rgb(252, 212, 224);
}

.--large {
  width: 30px;
  height: 30px;
}

.--medium {
  width: 15px;
  height: 15px;
}
.--small {
  width: 10px;
  height: 10px;
}
</style>
