<template>
  <div class="board" v-if="!inCheckMate">


    <div v-for="(rows, row) in BoardState" :key="row" class="row">
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
    <div class="extraInfo">
      <div class="turn-indicator">
        Current Turn: {{ currentPlayer === 'white' ? 'White' : 'Black' }}
      </div>
      <div class="turn-indicator" v-if="hostID">
        hostID:<br> {{ hostID }}
      </div>

    </div>

  </div>
  <div v-else>
    <audio autoplay src="https://cdn.pixabay.com/download/audio/2024/03/26/audio_9bc9244969.mp3?filename=crowd-cheering-198411.mp3" />
    You Win
    <img src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnRxZXpvb25vZDB4ZDIwbHkyYW5tdzVuamt6cjVyMmc5anc4enhsOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Dg4TxjYikCpiGd7tYs/giphy.gif"  alt="pedro"/>
    <RouterLink to="/" class="button" >Back to home</RouterLink>
  </div>

</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import PieceComponent from '../components/PieceComponent.vue'
import { AvailableMovesCoordinates, BoardState, currentPlayer, type Piece } from '@/hooks/BoardState'
import { getValidMoves, inCheckMate, useMovePiece, type vector2 } from '@/hooks/MovePiece'
import { hostID } from '@/hooks/PeerConnection'

const { movePiece } = useMovePiece()
const fromPiece = ref<{ fromPiece: Piece | null; Location: vector2 } | null>(null)


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


</script>

<style scoped>
.extraInfo{
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button {
 background-color: #FFFFFF;
 border: 0;
 border-radius: .5rem;
 box-sizing: border-box;
 color: #111827;
 font-family: "Inter var",ui-sans-serif,system-ui,-apple-system,system-ui,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
 font-size: .875rem;
 font-weight: 600;
 line-height: 1.25rem;
 padding: .75rem 1rem;
 text-align: center;
 text-decoration: none #D1D5DB solid;
 text-decoration-thickness: auto;
 box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
 cursor: pointer;
 user-select: none;
 -webkit-user-select: none;
 touch-action: manipulation;
  min-width: 150px;
}

.button:hover {
  background-color: rgb(249,250,251);
}

.button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.button:focus-visible {
  box-shadow: none;
}
.movable {
  box-shadow: inset 0 0 25px orange;
}

.board {
  width: 100%;
  height: 100vh;
  aspect-ratio: 1/1;
  overflow: hidden;
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
