<template>
  <div class="board">
    <div v-for="(row, x) in BoardState" :key="x" class="row">
      <div
        v-for="(cell, y) in row"
        :key="y"
        class="cell"
        @click="handleCellClick(x, y)"
      >
        <PieceComponent class="piece" :piece="cell" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PieceComponent from '../components/PieceComponent.vue'
import { BoardState, type Piece } from '@/hooks/BoardState'
import {useMovePiece , type vector2 } from '@/hooks/MovePiece'

type fromPieceWithLocation = {
  fromPiece: Piece | null;
  toLocation: vector2;
}

const { movePiece } = useMovePiece()
const fromPiece = ref<fromPieceWithLocation | null>(null);
const toLocation = ref<vector2 | null>(null);

const handleCellClick = (x: number, y: number) => {
  if(fromPiece.value?.fromPiece){
    if(toLocation.value){

      movePiece(fromPiece.value.toLocation, toLocation.value, fromPiece.value.fromPiece)
    }else{
      toLocation.value = { x, y }
    }
  }else{
    // no selected piece - select piece
    fromPiece.value = {
      fromPiece: BoardState.value[x][y],
      toLocation: { x, y }
    }
  }
};
</script>

<style scoped>
.board {
  width: 100%;
  height: 100vh;
  aspect-ratio: 1/1;
}
.row {
  background-color: white;
  height: 12.5%;
  width: 100%;
  display: flex;
}
.cell {
  height: 100%;
  width: 12.5%;
}
.row:nth-child(even) .cell:nth-child(odd) {
  background-color: black;
}
.row:nth-child(odd) .cell:nth-child(even) {
  background-color: black;
}
.piece {
  width: 100%;
  height: 100%;
}
.row:nth-child(even) .cell:nth-child(odd) .piece{
  filter: drop-shadow(0 0 0.5rem white);
}
.row:nth-child(odd) .cell:nth-child(even) .piece{
  filter: drop-shadow(0 0 0.5rem white);
}
</style>
