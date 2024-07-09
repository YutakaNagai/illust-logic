<script setup>
import { ref } from "vue";
import { supabase } from "../supabase";

const dot_field = ref([]);
for (let i = 0; i < 10; i++) {
  dot_field.value.push(Array(10).fill(false));
}

const title = ref("");
const description = ref("");

const paintCell = (c, r) => {
  dot_field.value[c][r] = !dot_field.value[c][r];
};

const saveIllust = () => {
  // ヒント作成用関数
  const createHint = (arr) => {
    let hint = "";
    let answer = "";

    arr.forEach((child_arr, c_index) => {
      let num_count = 0;
      child_arr.forEach((cell, index) => {
        if (cell) {
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
  const { data, error } = await supabase.from("illust_logic").insert([
    {
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
    },
  ]);
  console.log("data :>> ", data);
  console.log("error :>> ", error);
};

const initIllust = () => {
  dot_field.value.forEach((col, c_index) => {
    console.log("col :>> ", col);
    col.forEach((_, r_index) => {
      dot_field.value[c_index][r_index] = false;
    });
  });
};
</script>

<template>
  <div>
    <div>
      <button></button>
    </div>
    <div class="illust_field">
      <div
        v-for="(col, c_index) in dot_field"
        :key="`col_${c_index}`"
        class="col"
      >
        <div
          v-for="(row, r_index) in col"
          :key="`row_${r_index}`"
          class="cell"
          :class="row ? 'painted' : ''"
          @click="paintCell(c_index, r_index)"
        ></div>
      </div>
    </div>

    <div class="input_area">
      <div class="input_set">
        <span>タイトル: </span>
        <input type="text" v-model="title" />
      </div>
      <div class="input_set">
        <span>詳細: </span>
        <input type="text" v-model="description" />
      </div>
    </div>

    <div class="btn_area">
      <button @click="initIllust()">クリア</button>
      <button @click="saveIllust()">保存</button>
    </div>
  </div>
</template>

<style scoped>
.illust_field {
  display: flex;
  justify-content: center;
  margin: 25px;
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
</style>
