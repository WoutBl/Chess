<template>
  <div
    v-if="loading && gameType === 'remote'"
    class="w-screen h-screen flex flex-col justify-center items-center"
  >
    <div class="loader"></div>
    <p class="text-2xl mt-5">connecting to opponent</p>
    <p class="text-xl mt-5 flex">
      Click the <Info class="mx-2" /> to connect to opponent.
    </p>
  </div>
  <div class="flex justify-center items-center h-screen" v-else>
    <div class="w-screen lg:h-screen lg:w-auto aspect-square  lg:mx-auto" v-if="!inCheckMate">
      <div v-for="(rows, row) in BoardState" :key="row" class="row">
        <div
          v-for="(cell, col) in rows"
          :key="col"
          class="cell"
          @click="handleCellClick(row, col)"
          @drop="handleDrop($event, row, col)"
          @dragover.prevent
          :class="{
            movable: isAvailableMove({
              row: row,
              col: col
            })
          }"
        >
          <PieceComponent
            class="piece"
            :piece="cell"
            @dragstart="handleDragStart($event, row, col)"
            @dragend="handleDragEnd()"
            :cursor="currentPlayer === cell?.color ? 'grab' : 'not-allowed'"
            :drag="currentPlayer == cell?.color"
          />
        </div>
      </div>
      <div class="flex absolute top-0 left-1/2 -translate-x-1/2 lg:top-1/2 lg:-translate-y-1/2 lg:left-20 lg:translate-x-0 ">
        <div class="turn-indicator">
          Current Turn: {{ currentPlayer === 'white' ? 'White' : 'Black' }}
        </div>
      </div>
    </div>
    <div v-else>
      <audio
        autoplay
        src="https://cdn.pixabay.com/download/audio/2024/03/26/audio_9bc9244969.mp3?filename=crowd-cheering-198411.mp3"
      />
      You Win
      <img
        src="https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnRxZXpvb25vZDB4ZDIwbHkyYW5tdzVuamt6cjVyMmc5anc4enhsOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Dg4TxjYikCpiGd7tYs/giphy.gif"
        alt="pedro"
      />
      <RouterLink to="/" class="button">Back to home</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AvailableMovesCoordinates,
  BoardState,
  currentPlayer,
  inverted,
  type Piece,
  hasMoved,
  resetBoard,
  gameType
} from '@/hooks/BoardState'
import { getValidMoves, inCheckMate, Player, useMovePiece, type vector2 } from '@/hooks/MovePiece'
import { hostID, loading } from '@/hooks/PeerConnection'
import { onMounted, ref, watch } from 'vue'
import PieceComponent from '../components/PieceComponent.vue'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-vue-next'

const props = defineProps({
  onClickState: Function,
  state: String
})

const { movePiece } = useMovePiece()
const fromPiece = ref<{ fromPiece: Piece | null; Location: vector2 } | null>(null)

function cancelMove(): void {
  AvailableMovesCoordinates.value = []
  fromPiece.value = null
}

watch(
  () => loading.value,
  (newVal) => {
    if (!newVal) {
      resetBoard()
    }
  },
  { immediate: true, deep: true }
)

const movingPiece = ref<vector2 | null>(null)
const draggingOverLocation = ref<vector2 | null>(null)

function handleDragStart(event: DragEvent, row: number, col: number) {
  event.dataTransfer?.setData('text/plain', JSON.stringify({ row, col }))

  const piece: Piece | null = BoardState.value[row][col]
  movingPiece.value = {
    row,
    col
  }
  if (!piece) return
  AvailableMovesCoordinates.value = getValidMoves(
    {
      row,
      col
    },
    piece
  )
}

function handleDragEnd() {
  movingPiece.value = null
}

watch(
  hasMoved.value,
  () => {
    console.log(hasMoved)
  },
  { deep: true }
)

function handleDrop(event: DragEvent, row: number, col: number) {
  const data = event.dataTransfer?.getData('text/plain')
  if (!data) {
    return
  }
  const { row: sourceRow, col: sourceCol } = JSON.parse(data)
  AvailableMovesCoordinates.value = []

  const from: vector2 = { row: sourceRow, col: sourceCol }
  const to: vector2 = { row: row, col: col }
  const piece: Piece | null = BoardState.value[sourceRow][sourceCol]
  if (!piece) return console.error('no piece found')
  movePiece(from, to, piece)
}

const handleCellClick = (row: number, col: number) => {
  if (fromPiece.value?.Location?.col === col && fromPiece.value.Location.row == row) {
    return cancelMove()
  }

  if (fromPiece.value?.fromPiece) {
    const to: vector2 = { row, col }
    const result = movePiece(fromPiece.value.Location, to, fromPiece.value.fromPiece)
    if (!result) {
      console.log({ result })

      fromPiece.value = {
        fromPiece: BoardState.value[row][col],
        Location: { row, col }
      }

      if (fromPiece.value?.fromPiece?.color !== currentPlayer.value) return cancelMove()
      AvailableMovesCoordinates.value = getValidMoves(
        fromPiece.value.Location,
        fromPiece.value.fromPiece
      )
    } else return cancelMove()
  } else {
    // no selected piece - select piece
    fromPiece.value = {
      fromPiece: BoardState.value[row][col],
      Location: { row, col }
    }
    // show available tiles
    if (fromPiece.value?.fromPiece?.color !== currentPlayer.value) {
      return
    }
    AvailableMovesCoordinates.value = getValidMoves(
      fromPiece.value.Location,
      fromPiece.value.fromPiece!
    )
  }
}

const isAvailableMove = (coords: vector2): boolean => {
  let hasFoundRow: boolean = false
  AvailableMovesCoordinates.value?.forEach((value: vector2) => {
    if (value.col === coords.col && value.row === coords.row) {
      hasFoundRow = true
    }
  })

  return hasFoundRow
}

watch(
  inverted,
  (newVal) => {
    if (newVal) {
      BoardState.value.reverse()
    }
  },
  { immediate: true, deep: true }
)
</script>

<style scoped>
.loader {
  width: 50px;
  padding: 8px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: #25b09b;
  --_m: conic-gradient(#0000 10%, #000), linear-gradient(#000 0 0) content-box;
  -webkit-mask: var(--_m);
  mask: var(--_m);
  -webkit-mask-composite: source-out;
  mask-composite: subtract;
  animation: l3 1s infinite linear;
}
@keyframes l3 {
  to {
    transform: rotate(1turn);
  }
}
.row,
.cell {
  user-select: none;
}

.extraInfo {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button {
  background-color: #ffffff;
  border: 0;
  border-radius: 0.5rem;
  box-sizing: border-box;
  color: #111827;
  font-family:
    'Inter var',
    ui-sans-serif,
    system-ui,
    -apple-system,
    system-ui,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    'Noto Sans',
    sans-serif,
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji';
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.25rem;
  padding: 0.75rem 1rem;
  text-align: center;
  text-decoration: none #d1d5db solid;
  text-decoration-thickness: auto;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  min-width: 150px;
}

.button:hover {
  background-color: rgb(249, 250, 251);
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
