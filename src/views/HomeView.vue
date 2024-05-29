<template>
  <div class="board">
    <!-- Horizontal numbering -->
    <div class="row header">
      <div class="cell header-cell"></div>
      <!-- Empty cell for the top-left corner -->
      <div v-for="x in BoardState[0].length" :key="'header-' + x" class="cell header-cell">
        {{ x - 1 }} /{{ String.fromCharCode(97 + x - 1) }}
      </div>
    </div>

    <div v-for="(rows, row) in BoardState" :key="row" class="row">
      <!-- Vertical numbering -->
      <div class="cell header-cell">
        {{ row }}
      </div>
      <div v-for="(cell, col) in rows" :key="col" class="cell" @click="handleCellClick(row, col)">
        <PieceComponent class="piece" :piece="cell" />
      </div>
    </div>
    <div class="turn-indicator">
      Current Turn: {{ currentPlayer === 'white' ? 'White' : 'Black' }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import PieceComponent from '../components/PieceComponent.vue'
import { BoardState, type Piece, currentPlayer } from '@/hooks/BoardState'
import { useMovePiece, type vector2 } from '@/hooks/MovePiece'

type fromPieceWithLocation = {
  fromPiece: Piece | null
  Location: vector2
}

const { movePiece } = useMovePiece()
const fromPiece = ref<fromPieceWithLocation | null>(null)

const handleCellClick = (row: number, col: number) => {
  if (fromPiece.value?.fromPiece) {
    const to: vector2 = { row: row, col: col }
    movePiece(fromPiece.value.Location, to, fromPiece.value.fromPiece)
    fromPiece.value = null
  } else {
    // no selected piece - select piece
    fromPiece.value = {
      fromPiece: BoardState.value[row][col],
      Location: { row, col }
    }
  }
}
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
.row:nth-child(even) .cell:nth-child(odd) .piece {
  filter: drop-shadow(0 0 0.5rem white);
}
.row:nth-child(odd) .cell:nth-child(even) .piece {
  filter: drop-shadow(0 0 0.5rem white);
}
.header {
  height: 12.5%;
  width: 100%;
  display: flex;
  background-color: white !important;
}
.header-cell {
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  border: none; /* Remove border for header cells */
  color: black; /* Set text color to black for visibility */
  background-color: white !important;
}
.turn-indicator {
  margin-top: 20px;
  font-size: 24px;
  text-align: center;
}
</style>
