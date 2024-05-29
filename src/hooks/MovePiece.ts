import { ref } from 'vue'
import type { Piece } from '@/hooks/BoardState'
import { BoardState, currentPlayer, PieceType } from '@/hooks/BoardState'
import { usePeerConnection } from '@/hooks/PeerConnection'

const { sendMove } = usePeerConnection()

export type vector2 = {
  row: number
  col: number
}

export enum Player {
  black = 'black',
  white = 'white'
}

const inCheck = ref<Player | null>(null);

/**
 * move piece
 */
const movePiece = (from: vector2, to: vector2, piece: Piece) => {
  let validMoves = getValidMoves(from, piece);

  // If the player's king is in check, filter only moves that resolve the check
  if (inCheck.value === piece.color) {
    validMoves = validMoves.filter(move => !doesMoveLeaveKingInCheck(from, move, piece));
    if (validMoves.length === 0) {
      console.log("King is in check, you can't move this piece.");
      return;
    }
  }

  console.log(validMoves);
  const isValid = validMoves.some((move) => move.row === to.row && move.col === to.col);
  if (piece.color !== currentPlayer.value) {
    console.log("It's not your turn");
    return;
  }
  if (isValid) {
    BoardState.value[to.row][to.col] = piece;
    BoardState.value[from.row][from.col] = null; // clear the old position
    currentPlayer.value = currentPlayer.value === Player.white ? Player.black : Player.white; // Switch turns

    sendMove(from, to, piece);

    if (isCheck()) {
      console.log("Check!");

    } else {
      inCheck.value = null; // Clear check status if no longer in check
    }
  } else {
    console.log('invalid move');
  }
};

const getValidMoves = (from: vector2, piece: Piece): vector2[] => {
  switch (piece.type) {
    case PieceType.PAWN:
      return isValidPawnMoves(from, piece.color)
    case PieceType.BISHOP:
      return isValidBishopMoves(from, piece.color)
    case PieceType.KNIGHT:
      return isValidKnightMoves(from, piece.color)
    case PieceType.ROOK:
      return isValidRookMoves(from, piece.color)
    case PieceType.KING:
      return isValidKingMoves(from, piece.color)
    case PieceType.QUEEN:
      return isValidQueenMoves(from, piece.color)
    default:
      return []
  }
}

const isCheck = () => {
  let isInCheck = false;

  // Find the position of the opposing king
  let kingPosition: vector2 | null = null;
  BoardState.value.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell != null && cell.type === PieceType.KING && cell.color !== currentPlayer.value) {
        kingPosition = { row: rowIndex, col: colIndex };
      }
    });
  });

  if (!kingPosition) {
    console.log("King not found on the board.");
    return false;
  }

  // Check if any of the current player's pieces can move to the opposing king's position
  BoardState.value.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell != null && cell.color === currentPlayer.value) {
        const validMoves = getValidMoves({ row: rowIndex, col: colIndex }, cell);
        validMoves.forEach((move) => {
          if (move.row === kingPosition!.row && move.col === kingPosition!.col) {
            isInCheck = true;
          }
        });
      }
    });
  });

  if (isInCheck) {
    inCheck.value = currentPlayer.value === Player.white ? Player.black : Player.white;
  }

  return isInCheck;
};

const isCheckmate = (): boolean => {
  const playerInCheck = inCheck.value;
  if (!playerInCheck) return false;

  const allMoves = getAllValidMoves(playerInCheck);
  return allMoves.every(move => doesMoveLeaveKingInCheck(move.from, move.to, move.piece));
};

const getAllValidMoves = (player: Player): Array<{ from: vector2, to: vector2, piece: Piece }> => {
  const validMoves: Array<{ from: vector2, to: vector2, piece: Piece }> = [];

  BoardState.value.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell != null && cell.color === player) {
        const from = { row: rowIndex, col: colIndex };
        const moves = getValidMoves(from, cell);
        moves.forEach((to) => {
          validMoves.push({ from, to, piece: cell });
        });
      }
    });
  });

  return validMoves;
};

const isKingInCheck = (board: Piece[][], player: Player): boolean => {
  let isInCheck = false;

  // Find the position of the player's king
  let kingPosition: vector2 | null = null;
  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell != null && cell.type === PieceType.KING && cell.color === player) {
        kingPosition = { row: rowIndex, col: colIndex };
      }
    });
  });

  if (!kingPosition) {
    console.log("King not found on the board.");
    return false;
  }

  // Check if any of the opponent's pieces can move to the player's king's position
  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell != null && cell.color !== player) {
        const validMoves = getValidMoves({ row: rowIndex, col: colIndex }, cell);
        validMoves.forEach((move) => {
          if (move.row === kingPosition!.row && move.col === kingPosition!.col) {
            isInCheck = true;
          }
        });
      }
    });
  });

  return isInCheck;
};

const doesMoveLeaveKingInCheck = (from: vector2, to: vector2, piece: Piece): boolean => {
  const tempBoard = JSON.parse(JSON.stringify(BoardState.value)); // create a temporary board to simulate the move
  console.log(tempBoard)
  tempBoard[to.row][to.col] = piece;
  tempBoard[from.row][from.col] = null;

  return isKingInCheck(tempBoard, piece.color);
};

const validateAllMovesForCheck = (player: Player): boolean => {
  const allMoves = getAllValidMoves(player);
  return allMoves.some(move => !doesMoveLeaveKingInCheck(move.from, move.to, move.piece));
};

/**
 * Get all possible moves for pawn
 * @param current current location of the pawn
 * @param type black or white piece
 * @returns array of possible move locations
 */
const isValidPawnMoves = (current: vector2, type: Player): vector2[] => {
  const direction = type === Player.black ? 1 : -1
  const startRow = type === Player.white ? 6 : 1
  const availableMoves: vector2[] = []
  console.log(type)
  // immutable
  const boardState = BoardState.value

  // Check if the current position is within the bounds of the board (kinda redudant but just in case)
  if (
    current.row < 0 ||
    current.row >= boardState.length ||
    current.col < 0 ||
    current.col >= boardState[0].length
  ) {
    return availableMoves // Return empty array if out of bounds
  }

  // Check if there is a piece in front of the pawn
  if (
    !boardState[current.row + direction] ||
    boardState[current.row + direction][current.col] == null
  ) {
    // If there's no piece in front, the pawn can move forward
    availableMoves.push({ row: current.row + direction, col: current.col })

    // If it's on the starting row and can move forward twice, add that option
    if (current.row === startRow && !boardState[current.row + 2 * direction][current.col]) {
      availableMoves.push({ row: current.row + 2 * direction, col: current.col })
    }
  }

  // Check for diagonal attacks
  if (boardState[current.row + direction]) {
    // Check diagonal left
    if (
      current.col > 0 &&
      boardState[current.row + direction][current.col - 1] != null &&
      boardState[current.row + direction][current.col - 1]?.color !== type
    ) {
      availableMoves.push({ row: current.row + direction, col: current.col - 1 })
    }
    // Check diagonal right
    if (
      current.col < boardState[0].length - 1 &&
      boardState[current.row + direction][current.col + 1] != null &&
      boardState[current.row + direction][current.col + 1]?.color !== type
    ) {
      availableMoves.push({ row: current.row + direction, col: current.col + 1 })
    }
  }
  return availableMoves
}

/**
 * Get all possible moves for bishop
 * @param current current location of the pawn
 * @param type black or white piece
 * @returns array of possible move locations
 */
const isValidBishopMoves = (current: vector2, type: Player): vector2[] => {
  const availableMoves: vector2[] = []
  const boardState = BoardState.value

  // Check if the current position is within the bounds of the board
  if (
    current.row < 0 ||
    current.row >= boardState.length ||
    current.col < 0 ||
    current.col >= boardState[0].length
  ) {
    return availableMoves // Return empty array if out of bounds
  }

  // Bishop moves diagonally in all four directions until it hits another piece or the edge of the board
  const directions = [
    { row: -1, col: -1 }, // top-left
    { row: -1, col: 1 }, // top-right
    { row: 1, col: -1 }, // bottom-left
    { row: 1, col: 1 } // bottom-right
  ]

  for (const direction of directions) {
    let row = current.row + direction.row
    let col = current.col + direction.col

    while (row >= 0 && row < boardState.length && col >= 0 && col < boardState[0].length) {
      const cell = boardState[row][col]
      if (cell == null) {
        availableMoves.push({ row, col })
      } else {
        if (cell.color !== type) {
          availableMoves.push({ row, col }) // Can capture opponent's piece
        }
        break // Stop moving in this direction if there's a piece in the way
      }
      row += direction.row
      col += direction.col
    }
  }

  return availableMoves
}

/**
 * Get all possible moves for knight
 * @param current current location of the knight
 * @param type black or white piece
 * @returns array of possible move locations
 */
const isValidKnightMoves = (current: vector2, type: Player): vector2[] => {
  const availableMoves: vector2[] = []
  const boardState = BoardState.value

  // Check if the current position is within the bounds of the board
  if (
    current.row < 0 ||
    current.row >= boardState.length ||
    current.col < 0 ||
    current.col >= boardState[0].length
  ) {
    return availableMoves // Return empty array if out of bounds
  }

  // Knight moves in an L-shape: two squares in one direction and one square perpendicular
  const moves = [
    { row: current.row - 2, col: current.col - 1 },
    { row: current.row - 2, col: current.col + 1 },
    { row: current.row - 1, col: current.col - 2 },
    { row: current.row - 1, col: current.col + 2 },
    { row: current.row + 1, col: current.col - 2 },
    { row: current.row + 1, col: current.col + 2 },
    { row: current.row + 2, col: current.col - 1 },
    { row: current.row + 2, col: current.col + 1 }
  ]

  for (const move of moves) {
    if (
      move.row >= 0 &&
      move.row < boardState.length &&
      move.col >= 0 &&
      move.col < boardState[0].length
    ) {
      const cell = boardState[move.row][move.col]
      if (cell == null || cell.color !== type) {
        availableMoves.push(move) // Can move to empty square or capture opponent's piece
      }
    }
  }

  return availableMoves
}

/**
 * Get all possible moves for rook
 * @param current current location of the rook
 * @param type black or white piece
 * @returns array of possible move locations
 */
const isValidRookMoves = (current: vector2, type: Player): vector2[] => {
  const availableMoves: vector2[] = []
  const boardState = BoardState.value

  // Check if the current position is within the bounds of the board
  if (
    current.row < 0 ||
    current.row >= boardState.length ||
    current.col < 0 ||
    current.col >= boardState[0].length
  ) {
    return availableMoves // Return empty array if out of bounds
  }

  // Rook moves vertically and horizontally until it hits another piece or the edge of the board
  const directions = [
    { row: -1, col: 0 }, // up
    { row: 1, col: 0 }, // down
    { row: 0, col: -1 }, // left
    { row: 0, col: 1 } // right
  ]

  for (const direction of directions) {
    let row = current.row + direction.row
    let col = current.col + direction.col

    while (row >= 0 && row < boardState.length && col >= 0 && col < boardState[0].length) {
      const cell = boardState[row][col]
      if (cell == null) {
        availableMoves.push({ row, col })
      } else {
        if (cell.color !== type) {
          availableMoves.push({ row, col }) // Can capture opponent's piece
        }
        break // Stop moving in this direction if there's a piece in the way
      }
      row += direction.row
      col += direction.col
    }
  }

  return availableMoves
}

/**
 * Get all possible moves for king
 * @param current current location of the king
 * @param type black or white piece
 * @returns array of possible move locations
 */
const isValidKingMoves = (current: vector2, type: Player): vector2[] => {
  const availableMoves: vector2[] = []
  const boardState = BoardState.value

  // Check if the current position is within the bounds of the board
  if (
    current.row < 0 ||
    current.row >= boardState.length ||
    current.col < 0 ||
    current.col >= boardState[0].length
  ) {
    return availableMoves // Return empty array if out of bounds
  }

  // King moves one square in any direction
  const moves = [
    { row: current.row - 1, col: current.col - 1 }, // top-left
    { row: current.row - 1, col: current.col }, // top
    { row: current.row - 1, col: current.col + 1 }, // top-right
    { row: current.row, col: current.col - 1 }, // left
    { row: current.row, col: current.col + 1 }, // right
    { row: current.row + 1, col: current.col - 1 }, // bottom-left
    { row: current.row + 1, col: current.col }, // bottom
    { row: current.row + 1, col: current.col + 1 } // bottom-right
  ]

  for (const move of moves) {
    if (
      move.row >= 0 &&
      move.row < boardState.length &&
      move.col >= 0 &&
      move.col < boardState[0].length
    ) {
      const cell = boardState[move.row][move.col]
      if (cell == null || cell.color !== type) {
        availableMoves.push(move) // Can move to empty square or capture opponent's piece
      }
    }
  }

  return availableMoves
}

/**
 * Get all possible moves for queen
 * @param current current location of the queen
 * @param type black or white piece
 * @returns array of possible move locations
 */
const isValidQueenMoves = (current: vector2, type: Player): vector2[] => {
  const availableMoves: vector2[] = []
  const boardState = BoardState.value

  // Check if the current position is within the bounds of the board
  if (
    current.row < 0 ||
    current.row >= boardState.length ||
    current.col < 0 ||
    current.col >= boardState[0].length
  ) {
    return availableMoves // Return empty array if out of bounds
  }

  // Queen moves in any direction
  const directions = [
    { row: -1, col: 0 }, // up
    { row: 1, col: 0 }, // down
    { row: 0, col: -1 }, // left
    { row: 0, col: 1 }, // right
    { row: -1, col: -1 }, // top-left
    { row: -1, col: 1 }, // top-right
    { row: 1, col: -1 }, // bottom-left
    { row: 1, col: 1 } // bottom-right
  ]

  for (const direction of directions) {
    let row = current.row + direction.row
    let col = current.col + direction.col

    while (row >= 0 && row < boardState.length && col >= 0 && col < boardState[0].length) {
      const cell = boardState[row][col]
      if (cell == null) {
        availableMoves.push({ row, col })
      } else {
        if (cell.color !== type) {
          availableMoves.push({ row, col }) // Can capture opponent's piece
        }
        break // Stop moving in this direction if there's a piece in the way
      }
      row += direction.row
      col += direction.col
    }
  }

  return availableMoves
}

export const useMovePiece = () => {
  return {
    movePiece
  }
}
