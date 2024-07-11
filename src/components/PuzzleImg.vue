<script setup>
import { onMounted, ref, watch } from "vue";
const props = defineProps({
  illust: Array,
  cellNum: Number,
});
const illust = ref(props.illust);
const cell_num = ref(props.cellNum);
const cell_size = ref(0);

// テンプレート参照
const puzzle_area = ref(null);
const area_width = ref(
  puzzle_area.value ? puzzle_area.value.getBoundingClientRect().width : 0
);

onMounted(() => {
  puzzle_area.value.focus();
  // イラスト作成画面の場合、90% * 60% = 54%
  const illust_width = (window.innerWidth * 54) / 100;
  cell_size.value = illust_width / cell_num.value;
});
</script>
<template>
  <div ref="puzzle_area" class="puzzle_img">
    <div
      v-for="(col, c_index) in illust"
      :key="`col_${c_index}`"
      class="puzzle_img_col"
    >
      <div
        v-for="(row, r_index) in col"
        :key="`row_${r_index}`"
        :id="`${c_index}_${r_index}`"
        class="puzzle_img_cell"
        :class="illust[c_index][r_index] ? 'painted' : ''"
        :style="`width: ${cell_size}px;`"
      ></div>
    </div>
  </div>
</template>
<style scoped>
.puzzle_img {
  width: 100%;
  display: flex;
  justify-content: center;
  border: 1px solid black;
}
.puzzle_img_cell {
  aspect-ratio: 1/1;
}
.painted {
  background-color: rgb(104, 98, 98);
}
</style>
