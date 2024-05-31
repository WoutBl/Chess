<template>
  <div class="board" v-if="!inCheckMate">
    <div class="row header">
      <div class="cell header-cell"></div>
      <!-- Empty cell for the top-left corner -->
      <div v-for="x in BoardState[0].length" :key="'header-' + x" class="cell header-cell">
        {{ x - 1 }} /{{ String.fromCharCode(97 + x - 1) }}
      </div>
    </div>

    <div v-for="(rows, row) in BoardState" :key="row" class="row">
      <div class="cell header-cell">{{ row }}</div>
      <div v-for="(cell, col) in rows" :key="col" class="cell" @click="handleCellClick(row, col)" :class="{
        movable: isAvailableMove({
          row: row,
          col: col
        })
      }"
      >
        <PieceComponent class="piece" :piece="cell" />
      </div>
    </div>

    <div class="turn-indicator">
      Current Turn: {{ currentPlayer === 'white' ? 'White' : 'Black' }}
    </div>
    <div class="peer-actions">
      <button @click="startHost">Start Host</button>
      <button @click="joinHost">Join Host</button>
      <input v-model="hostId" placeholder="Enter Host ID to Join" />
    </div>
  </div>
  <div v-else>
    <audio autoplay src="https://cdn.pixabay.com/download/audio/2024/03/26/audio_9bc9244969.mp3?filename=crowd-cheering-198411.mp3" />
    You Win
    <img src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnRxZXpvb25vZDB4ZDIwbHkyYW5tdzVuamt6cjVyMmc5anc4enhsOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Dg4TxjYikCpiGd7tYs/giphy.gif"  alt="pedro"/>
  </div>

</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import PieceComponent from '../components/PieceComponent.vue'
import { AvailableMovesCoordinates, BoardState, currentPlayer, type Piece } from '@/hooks/BoardState'
import { getValidMoves, inCheckMate, useMovePiece, type vector2 } from '@/hooks/MovePiece'
import { usePeerConnection } from '@/hooks/PeerConnection'

const { movePiece } = useMovePiece()
const { startPeer } = usePeerConnection()
const fromPiece = ref<{ fromPiece: Piece | null; Location: vector2 } | null>(null)
const hostId = ref<string>('')


const handleCellClick = (row: number, col: number) => {
  if (fromPiece.value?.fromPiece) {
    const to: vector2 = { row, col }
    const result = movePiece(fromPiece.value.Location, to, fromPiece.value.fromPiece)
    if (!result) {
      console.log({result})

      fromPiece.value = {
        fromPiece: BoardState.value[row][col],
        Location: { row, col }
      }

      if (fromPiece.value?.fromPiece?.color !== currentPlayer.value ) {
        AvailableMovesCoordinates.value = []
        fromPiece.value = null

        return
      }
      const validMoves = getValidMoves(fromPiece.value.Location, fromPiece.value.fromPiece)
      AvailableMovesCoordinates.value = validMoves
      // show available tiles
    } else {
      fromPiece.value = null
      AvailableMovesCoordinates.value = []
    }

  } else {
    // no selected piece - select piece
    fromPiece.value = {
      fromPiece: BoardState.value[row][col],
      Location: { row, col }
    }
    // show available tiles
   if (fromPiece.value?.fromPiece?.color !== currentPlayer.value ) {return}
    AvailableMovesCoordinates.value = getValidMoves(fromPiece.value.Location, fromPiece.value.fromPiece!)


  }
}

const isAvailableMove = (coords: vector2) : boolean=> {
  let hasFoundRow: boolean = false
  AvailableMovesCoordinates.value?.forEach((value: vector2) => {
    if (value.col === coords.col && value.row === coords.row) {
      hasFoundRow = true
    }
  })
  return hasFoundRow


}


// watch(AvailableMovesCoordinates, () => {
//   console.log(AvailableMovesCoordinates.value)
// })

const startHost = () => {
  startPeer('hey', true)
}

const joinHost = () => {
  startPeer(hostId.value, false)
}
</script>

<style scoped>
.movable {
  box-shadow: inset 0 0 25px orange;
}

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

.peer-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>
