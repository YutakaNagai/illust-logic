<script setup>
import { onMounted, ref, watch } from "vue";
import { supabase } from "../supabase";

const dot_field = ref([]);
const size = ref(Number(sessionStorage.getItem("size")) || 10);
for (let i = 0; i < size.value; i++) {
  dot_field.value.push(Array(size.value).fill(false));
}

const title = ref("");
const description = ref("");

const error_list = ref([]);
const title_textarea = ref(null);
const description_textarea = ref(null);
const error_sticky = ref(null);
const illust_field = ref(null);

const paintCell = (c, r) => {
  dot_field.value[c][r] = !dot_field.value[c][r];
};

onMounted(() => {
  title_textarea.value.focus();
  description_textarea.value.focus();
  illust_field.value.focus();

  let move_action = "paint";
  illust_field.value.ontouchstart = (event) => {
    console.log("touch start");
    // タッチ開始時点のセルが黒なら黒→白、白なら白→黒
    move_action = event.touches[0].target.classList.contains("painted")
      ? "erase"
      : "paint";
  };
  illust_field.value.ontouchmove = (event) => {
    // 画面のスクロールを防止する
    const touch = event.touches[0];
    const slide_target = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    );
    if (slide_target.classList.contains("cell")) {
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

const saveIllust = () => {
  error_list.value = [];
  error_sticky.value.classList.remove("error_slidein");
  let is_error = false;
  // バリデーション
  if (!title.value || !title.value.match(/\S/g)) {
    displayError("title", "タイトルが未設定です。");
    is_error = true;
  }
  if (!description.value || !description.value.match(/\S/g)) {
    displayError("description", "詳細が未設定です。");
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
    const col = createHint(dot_field.value);

    // 二次元配列を転置
    const transpose_array = dot_field.value[0].map((_, c) =>
      dot_field.value.map((r) => r[c])
    );

    // 水平方向のヒント作成
    const row = createHint(transpose_array);

    if (is_blank) {
      displayError("dot_field", "作図が行われていません。");
      is_error = true;
    }

    if (!is_error) {
      addPuzzle(
        title.value,
        description.value,
        "0",
        "テストユーザー",
        col.answer,
        col.hint,
        row.answer,
        row.hint,
        dot_field.value.length,
        dot_field.value[0].length
      );
    }
  }
};

const addPuzzle = async (
  title,
  description,
  creator_id,
  creator_name,
  col_answer,
  col_hint,
  row_answer,
  row_hint,
  num_of_col,
  num_of_row
) => {
  const record = {
    title,
    description,
    creator_id,
    creator_name,
    col_answer,
    col_hint,
    row_answer,
    row_hint,
    num_of_col,
    num_of_row,
    challenged: 0,
    solved: 0,
    good: 0,
    bad: 0,
    is_deleted: false,
  };
  const { data, error } = await supabase.from("illust_logic").insert([record]);
  console.group("下記のレコードをDBに登録しました。");
  console.table(record);
  console.groupEnd();
};

const initIllust = () => {
  dot_field.value.forEach((col, c_index) => {
    col.forEach((_, r_index) => {
      dot_field.value[c_index][r_index] = false;
    });
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

const displayError = (err, msg) => {
  if (err === "title") {
    title_textarea.value.classList.add("error_bg");
    error_list.value.push(msg);
  }
  if (err === "description") {
    description_textarea.value.classList.add("error_bg");
    error_list.value.push(msg);
  }
  if (err === "dot_field") {
    error_list.value.push(msg);
  }
  error_sticky.value.classList.add("error_slidein");
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
    <div ref="error_sticky" class="error_sticky">
      <div
        v-for="(error, index) in error_list"
        :key="`error_${index}`"
        class="error_msg"
      >
        エラー: {{ error }}
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
          class="cell"
          :class="
            (row ? 'painted' : '',
            size == 10 ? '--large' : size == 20 ? '--medium' : '--small')
          "
          @click="paintCell(c_index, r_index)"
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
      <button @click="initIllust()">クリア</button>
      <button @click="saveIllust()">保存</button>
    </div>
  </div>
</template>

<style scoped>
.error_sticky {
  position: absolute;
  width: 100%;
  top: 0;
  left: 0;
  display: flex;
  flex-flow: column;
  background-color: #fcd4e0;
  text-align: left;
  box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.5),
    inset 0px -3px 6px -2px rgba(0, 0, 0, 0.3);
  transition: 1s cubic-bezier(0.23, 1, 0.32, 1);
  line-height: 2;
  transform: translateY(-40px);
}
.error_slidein {
  transform: none;
}
.error_msg {
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
  border: 1px solid black;
  margin-bottom: -1px;
  margin-right: -1px;
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
.btn_area {
  display: flex;
  justify-content: space-evenly;
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
