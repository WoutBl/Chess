import { ref } from 'vue'
import type { Piece } from '@/hooks/BoardState'
import { BoardState, PieceType } from '@/hooks/BoardState'

const selectedPiece = ref<Piece | null>(null);
const selectedPosition = ref<{ x: number; y: number } | null>(null);



export type vector2 = {
  x: number
  y: number
}

export enum Player {
  black = 'black',
white = 'white'
}


const movePiece = (from: vector2, to: vector2, piece: Piece) => {
  const validMoves = getValidMoves(from, piece)
  // check if valid moves is in the list of valid moves
  console.log(validMoves)
  console.log(to)
  console.log(validMoves.indexOf(to))
  if(validMoves.indexOf(to) !== -1) { // double chek
    console.log("is valid")
    BoardState.value[to.x][to.y] = piece
  }
  if (!validMoves) return
}

const getValidMoves = (from: vector2, piece:Piece): vector2[] => {
  switch (piece.type) {
    case PieceType.PAWN:
      return isValidPawnMoves(from, piece.color)
    default:
      return []
  }
}

/**
 * Get all possible moves for pawn
 * @param current current location of the pawn
 * @param type black or white piece
 * @returns array of possible move locations
 */
const isValidPawnMoves = (current: vector2, type: Player  ) : vector2[] =>  {
  const direction = type === Player.black ? -1 : 1
  const startRow = type === Player.white ? 6 : 1
  const availableMoves: vector2[] = []

  // immutable
  const boardState = BoardState.value

  // check if there is a piece in front of the pawn
  const canMoveForward: boolean = !!(boardState[current.x][current.y + direction] )
  const canMoveForwardTwice = !!(boardState[current.x][current.y + 2 * direction] )
  const canAttackRight = (boardState[current.x + direction][current.y + direction]?.color !== type)
// deze is broken
  const canAttackLeft = (boardState[current.x - direction][current.y + direction]?.color !== type)


  if(canMoveForward && startRow !== current.y){
    console.log("canMoveForward")
    availableMoves.push({ x: current.x, y: current.y + direction })
  }if (canMoveForward && canMoveForwardTwice && startRow === current.y){
    console.log("canMoveForwardtwice")
    availableMoves.push({x: current.x, y: current.y + 2 * direction})
  }if(canAttackLeft){
    console.log("left")
    availableMoves.push({x: current.x - direction, y: current.y + direction})
  }if(canAttackRight){
    console.log("right")
    availableMoves.push({x: current.x + direction, y: current.y + direction})
  }

  // laatste rij checken
  return availableMoves
}

export const useMovePiece = () => {
  return {
    movePiece
  };
};







































// const handleCellClick = (FromX: number, FromY: number) => {
//   const cell = BoardState.value[FromX][FromY];
//
//   if (selectedPiece.value) {
//     BoardState.value[FromX][FromY] = selectedPiece.value;
//     if (selectedPosition.value) {
//       BoardState.value[selectedPosition.value.x][selectedPosition.value.y] = null;
//     }
//     selectedPiece.value = null;
//     selectedPosition.value = null;
//   } else if (cell) {
//     selectedPiece.value = cell;
//     selectedPosition.value = { x: FromX, y: FromY };
//   }
// };
//
//
//
//
//
//
//
// const isValidPawnMove = (fromX: number, fromY: number): boolean => {
//   if (!selectedPiece.value || !selectedPosition.value) return false;
//
//   const { x: startX, y: startY } = selectedPosition.value;
//   const piece = selectedPiece.value;
//
//   if (piece.type === 'pawn') {
//     const direction = piece.color === 'white' ? -1 : 1;
//
//     // Move forward
//     if (startX + direction === fromX && startY === fromY && !board.value[fromX][fromY]) {
//       return true;
//     }
//
//     // Capture diagonally
//     if (
//       startX + direction === fromX &&
//       (startY - 1 === fromY || startY + 1 === fromY) &&
//       board.value[fromX][fromY] &&
//       board.value[fromX][fromY]?.color !== piece.color
//     ) {
//       return true;
//     }
//   }
//
//   return false;
// };
//
//

