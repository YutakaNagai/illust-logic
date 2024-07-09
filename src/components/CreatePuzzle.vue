<script setup>
import { ref } from "vue";

const dot_field = ref([]);
for (let i = 0; i < 10; i++) {
  dot_field.value.push(Array(10).fill(false));
}

const paintCell = (c, r) => {
  dot_field.value[c][r] = !dot_field.value[c][r];
};

const saveIllust = () => {
  // ヒント作成用関数
  const createHint = (arr) => {
    const col_nums = [];
    let hint_str = "";

    arr.forEach((child_arr, c_index) => {
      let num_count = 0;
      child_arr.forEach((cell, index) => {
        if (cell) {
          // 塗られていたらカウントをインクリメント
          num_count++;
          if (index + 1 === child_arr.length) {
            // 列末尾の場合、カウントをプッシュ
            hint_str += num_count;
            num_count = 0;
          }
        } else if (num_count > 0) {
          // 塗られていない場合、カウントがたまっていればプッシュ
          hint_str +=
            index + 1 === child_arr.length ? num_count : `${num_count},`;
          num_count = 0;
        }
      });

      if (hint_str.endsWith(",")) {
        hint_str = hint_str.slice(0, -1);
      }
      // 一行（列）分終わったら区切り記号としてスラッシュを置く
      if (c_index + 1 !== arr.length) {
        hint_str += "/";
      }
    });

    return hint_str;
  };

  // 垂直方向のヒント作成
  const col_hint = createHint(dot_field.value);
  console.log("col_hint :>> ", col_hint);

  // 二次元配列を転置
  const transpose_array = dot_field.value[0].map((_, c) =>
    dot_field.value.map((r) => r[c])
  );

  // 水平方向のヒント作成
  const row_hint = createHint(transpose_array);
  console.log("row_hint :>> ", row_hint);
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

    <div class="btn_area">
      <button @click="initIllust()">クリア</button>
      <button @click="saveIllust()">保存</button>
    </div>
  </div>
</template>

<style scoped>
.illust_field {
  display: flex;
  margin-bottom: 100px;
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
.btn_area {
  display: flex;
  justify-content: space-between;
}
</style>
