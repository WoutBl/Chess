<template>
  <div class="board">
    <div v-for="(row, x) in board" :key="x" class="row">
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
import { ref } from 'vue';
import PieceComponent from '../components/PieceComponent.vue';

type Piece = {
  type: 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
  color: 'white' | 'black';
};

type Board = (Piece | null)[][];

const initialBoard: Board = [
  [
    { type: 'rook', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'queen', color: 'black' },
    { type: 'king', color: 'black' },
    { type: 'bishop', color: 'black' },
    { type: 'knight', color: 'black' },
    { type: 'rook', color: 'black' },
  ],
  Array(8).fill(null).map(() => ({ type: 'pawn', color: 'black' })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'pawn', color: 'white' })),
  [
    { type: 'rook', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'queen', color: 'white' },
    { type: 'king', color: 'white' },
    { type: 'bishop', color: 'white' },
    { type: 'knight', color: 'white' },
    { type: 'rook', color: 'white' },
  ]
];

const board = ref<Board>(initialBoard);

const selectedPiece = ref<Piece | null>(null);
const selectedPosition = ref<{ x: number; y: number } | null>(null);

const handleCellClick = (x: number, y: number) => {
  const cell = board.value[x][y];

  if (selectedPiece.value) {
    // Move the selected piece
    board.value[x][y] = selectedPiece.value;
    if (selectedPosition.value) {
      board.value[selectedPosition.value.x][selectedPosition.value.y] = null;
    }
    selectedPiece.value = null;
    selectedPosition.value = null;
  } else if (cell) {
    // Select a piece
    selectedPiece.value = cell;
    selectedPosition.value = { x, y };
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
