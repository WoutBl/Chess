import { ref } from 'vue'
import type { Piece } from '@/hooks/BoardState'
import { BoardState, PieceType } from '@/hooks/BoardState'

const selectedPiece = ref<Piece | null>(null);
const selectedPosition = ref<{ x: number; y: number } | null>(null);



export type vector2 = {
  row: number
  col: number
}

export enum Player {
  black = 'black',
white = 'white'
}


const movePiece = (from: vector2, to: vector2, piece: Piece) => {
  const validMoves = getValidMoves(from, piece)

  const isValid = validMoves.some(move => move.row === to.row && move.col === to.col);
  if (isValid) {

    BoardState.value[to.row][to.col] = piece
    BoardState.value[from.row][from.col] = null; // clear the old position
  } else {
    console.log("invalid move");
  }
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
  const direction = type === Player.black ? 1 : -1
  const startRow = type === Player.white ? 6 : 1
  const availableMoves: vector2[] = []
  console.log(type)
  // immutable
  const boardState = BoardState.value

  // Check if the current position is within the bounds of the board (kinda redudant but just in case)
  if (current.row < 0 || current.row >= boardState.length || current.col < 0 || current.col >= boardState[0].length) {
    return availableMoves; // Return empty array if out of bounds
  }


  // Check if there is a piece in front of the pawn
  if (!boardState[current.row + direction] || boardState[current.row + direction][current.col] == null) {
    // If there's no piece in front, the pawn can move forward
    availableMoves.push({ row: current.row + direction, col: current.col });

    // If it's on the starting row and can move forward twice, add that option
    if (current.row === startRow && !boardState[current.row + 2 * direction][current.col]) {
      availableMoves.push({ row: current.row + 2 * direction, col: current.col });
    }
  }

   // Check for diagonal attacks
    if (boardState[current.row + direction]) {
      // Check diagonal left
      if (current.col > 0 && boardState[current.row + direction][current.col - 1] != null && boardState[current.row + direction][current.col - 1]?.color !== type) {
        availableMoves.push({ row: current.row + direction, col: current.col - 1 });
      }
      // Check diagonal right
      if (current.col < boardState[0].length - 1 && boardState[current.row + direction][current.col + 1] != null && boardState[current.row + direction][current.col + 1]?.color !== type) {
        availableMoves.push({ row: current.row + direction, col: current.col + 1 });
      }
    }
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

