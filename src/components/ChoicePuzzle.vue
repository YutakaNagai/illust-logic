<script setup>
import { onMounted, ref, watch } from "vue";
import { supabase } from "../supabase";

const puzzle_list = ref([]);

onMounted(async () => {
  const res = await getPuzzle();
  puzzle_list.value = res.data;
});

const getPuzzle = async () => {
  return await supabase.from("illust_logic").select().limit(20);
};
const getSolvePuzzle = async () => {
  // TODO: ログインユーザと照合してリストを取得
  return await supabase.from("solve_puzzles").select().limit();
};
</script>

<template>
  <div class="choice_puzzle">
    <div>
      <!-- TODO: リスト内のみスクロール可能にする -->
      <div
        v-for="(puzzle, index) in puzzle_list"
        :key="`puzzle_${index}`"
        class="puzzle_wrapper"
      >
        <div class="size">
          <img src="../assets/size.png" class="size_icon" />
          <div class="label_number">
            {{ puzzle.num_of_col }} x {{ puzzle.num_of_row }}
          </div>
        </div>
        <div class="description">
          <!-- TODO: solve_puzzlesテーブルと照合した結果で画像を切り替える -->
          <img src="../assets/user_solved.png" class="user_solved_icon" />
          <!-- TODO: 2行でも問題ないようにする。もしくはオーバーフロー処理を追加 -->
          <div>{{ puzzle.description }}</div>
        </div>

        <div class="other_info">
          <div class="solved">
            <img src="../assets/solved.png" class="solved_icon" />
            <div class="label_number">
              {{ Math.trunc(puzzle.solved / puzzle.challenged) || 0 }}%
            </div>
          </div>
          <div class="challenged">
            <img src="../assets/challenged.png" class="icon" />
            <div class="label_number">{{ puzzle.challenged }}</div>
          </div>
          <div class="good">
            <img src="../assets/good.png" class="icon" />
            <div class="label_number">{{ puzzle.good }}</div>
          </div>
          <div class="bad">
            <img src="../assets/bad.png" class="icon" />
            <div class="label_number">{{ puzzle.bad }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.choice_puzzle {
  position: relative;
  width: 100vw;
  height: calc(100vh - 80px);
  display: flex;
  flex-flow: column;
  text-align: left;
}
.puzzle_wrapper {
  position: relative;
  width: 90%;
  border: 1px solid black;
  border-radius: 10px;
  margin: 10px;
}
.description {
  position: relative;
  padding-top: 10px;
  width: 95%;
  display: flex;
  font-size: x-large;
}
.user_solved_icon {
  width: 30px;
  height: 30px;
}
.other_info {
  display: flex;
  justify-content: space-evenly;
}
.icon {
  width: 20px;
}
.size {
  position: relative;
  margin-left: auto;
  right: 0;
  display: flex;
  justify-content: space-evenly;
  width: 100px;
  height: 30px;
  border: 3px solid rgb(75, 75, 75);
  border-radius: 10px;
  color: rgb(75, 75, 75);
  font-size: large;
}
.size_icon {
  width: 25px;
  aspect-ratio: 1/1;
}
.solved {
  display: flex;
  justify-content: space-around;
  width: 30%;
  height: 30%;
  border: 3px solid rgb(75, 75, 75);
  border-radius: 10px;
  color: rgb(75, 75, 75);
  font-size: large;
}
.solved_icon {
  width: 25px;
  aspect-ratio: 1/1;
}
.challenged {
  display: flex;
  justify-content: space-evenly;
  width: 13%;
  border: 4px solid rgb(94, 238, 107);
  border-radius: 10px;
  color: rgb(94, 238, 107);
  font-size: large;
}
.good {
  display: flex;
  justify-content: space-evenly;
  width: 13%;
  border: 4px solid rgb(255, 173, 173);
  border-radius: 10px;
  color: rgb(255, 173, 173);
  font-size: large;
}
.bad {
  display: flex;
  justify-content: space-evenly;
  width: 13%;
  border: 4px solid rgb(73, 211, 255);
  border-radius: 10px;
  color: rgb(73, 211, 255);
  font-size: large;
}
</style>
