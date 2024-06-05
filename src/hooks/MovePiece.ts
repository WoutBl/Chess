import {
  BoardState,
  currentPlayer,
  gameFinished,
  hasMoved,
  inverted,
  type Piece,
  PieceType,
  gameType
} from '@/hooks/BoardState'
import { usePeerConnection } from '@/hooks/PeerConnection'
import { hasAnyMoved } from '@/utils/move'
import { ref } from 'vue'

export type vector2 = {
  row: number
  col: number
}

export enum Player {
  black = 'black',
  white = 'white'
}

const inCheck = ref<Player | null>(null)
export const inCheckMate = ref<boolean>(false)

function movePieceOnBoard(from: vector2, to: vector2, piece: Piece) {
  BoardState.value[to.row][to.col] = piece
  BoardState.value[from.row][from.col] = null // clear the old position

  const color = inverted.value ? 'white' : 'black'
  const colorOpponent = inverted.value ? 'black' : 'white'
  const hasMovedColor = hasMoved.value[color as 'black' | 'white']
  const hasMovedColorOpponent = hasMoved.value[colorOpponent as 'black' | 'white']

  if (piece.type == PieceType.ROOK) {
    if (from.col == 0 && from.row == 0) {
      hasMovedColor.rookLeft = true
    }
    if (from.col == 7 && from.row == 0) {
      hasMovedColor.rookRight = true
    }
    if (from.col == 0 && from.row == 7) {
      hasMovedColorOpponent.rookLeft = true
    }
    if (from.col == 7 && from.row == 7) {
      hasMovedColorOpponent.rookRight = true
    }
  }

  if (piece.type == PieceType.KING) {
    if (from.row == 0) {
      hasMovedColor.king = true
    }
    if (from.row == 7) {
      hasMovedColorOpponent.king = true
    }
  }
}

/**
 * move piece
 * @param from
 * @param to
 * @param piece
 */
const movePiece = (
  from: vector2,
  to: vector2,
  piece: Piece,
  comesFromRemote: boolean = false
): boolean => {
  const { sendMove, sendTurn, isHost } = usePeerConnection()
  // Restriction based on host and piece color for local moves
  console.log(gameType.value)
  if (gameType.value === 'remote') {
    if (
      (!comesFromRemote && isHost.value && piece.color === Player.black) ||
      (!comesFromRemote && !isHost.value && piece.color === Player.white)
    ) {
      console.log('You are not allowed to move this piece')
      return false
    }
  }

  if (gameFinished.value) {
    return false
  }
  if (inCheckMate.value) {
    return false
  }
  if (piece.color !== currentPlayer.value) {
    console.log("It's not your turn")
    return false
  }
  const validMoves = getValidMoves(from, piece)
  const isValid = validMoves.some((move) => move.row === to.row && move.col === to.col)
  if (!isValid) {
    console.log('Invalid move')
    return false
  }

  // Check for checkmate
  if (isCheckmate()) {
    console.log('Checkmate!')
    gameFinished.value = true
    inCheckMate.value = true
  }

  if (!hasCastled(from, to, piece)) {
    movePieceOnBoard(from, to, piece)
    sendMove(from, to, piece) // Send the move to the peer
    currentPlayer.value = currentPlayer.value === Player.white ? Player.black : Player.white // Switch turns
    sendTurn(currentPlayer.value)
  }
  // After making the move, check if the move puts the opponent's king in check
  const checkStatus = isCheck()

  if (checkStatus) {
    console.log('Check!')
    inCheck.value = currentPlayer.value === Player.white ? Player.black : Player.white
  } else {
    inCheck.value = null
  }

  return true
}

export const getValidMoves = (from: vector2, piece: Piece): vector2[] => {
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
  let isInCheck = false

  // Find the position of the opposing king
  let kingPosition: vector2 | null = null
  BoardState.value.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell != null && cell.type === PieceType.KING && cell.color !== currentPlayer.value) {
        kingPosition = { row: rowIndex, col: colIndex }
      }
    })
  })

  if (!kingPosition) {
    console.log('King not found on the board.')
    return false
  }

  // Check if any of the current player's pieces can move to the opposing king's position
  BoardState.value.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell != null && cell.color === currentPlayer.value) {
        const validMoves = getValidMoves({ row: rowIndex, col: colIndex }, cell)
        validMoves.forEach((move) => {
          if (move.row === kingPosition!.row && move.col === kingPosition!.col) {
            isInCheck = true
          }
        })
      }
    })
  })

  if (isInCheck) {
    inCheck.value = currentPlayer.value === Player.white ? Player.black : Player.white
  }

  return isInCheck
}

const isCheckmate = (): boolean => {
  const playerInCheck = inCheck.value
  let isInCheckMate = false
  if (!playerInCheck) return false

  const allMoves = getAllValidMoves(playerInCheck)
  isInCheckMate = allMoves.every((move) => doesMoveLeaveKingInCheck(move.from, move.to, move.piece))
  if (isInCheckMate) {
    inCheckMate.value = isInCheckMate
  }
  return inCheckMate.value
}

const getAllValidMoves = (player: Player): Array<{ from: vector2; to: vector2; piece: Piece }> => {
  const validMoves: Array<{ from: vector2; to: vector2; piece: Piece }> = []

  BoardState.value.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell != null && cell.color === player) {
        const from = { row: rowIndex, col: colIndex }
        const moves = getValidMoves(from, cell)
        moves.forEach((to) => {
          validMoves.push({ from, to, piece: cell })
        })
      }
    })
  })

  return validMoves
}

const isKingInCheck = (board: Piece[][], player: Player): boolean => {
  let isInCheck = false

  // Find the position of the player's king
  let kingPosition: vector2 | null = null
  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell != null && cell.type === PieceType.KING && cell.color === player) {
        kingPosition = { row: rowIndex, col: colIndex }
      }
    })
  })

  if (!kingPosition) {
    console.log('King not found on the board.')
    return false
  }

  // Check if any of the opponent's pieces can move to the player's king's position
  board.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell != null && cell.color !== player) {
        const validMoves = getValidMoves({ row: rowIndex, col: colIndex }, cell)
        validMoves.forEach((move) => {
          if (move.row === kingPosition!.row && move.col === kingPosition!.col) {
            isInCheck = true
          }
        })
      }
    })
  })

  return isInCheck
}

const doesMoveLeaveKingInCheck = (from: vector2, to: vector2, piece: Piece): boolean => {
  const tempBoard = JSON.parse(JSON.stringify(BoardState.value)) // create a temporary board to simulate the move
  tempBoard[to.row][to.col] = piece
  tempBoard[from.row][from.col] = null

  return isKingInCheck(tempBoard, piece.color)
}

const validateAllMovesForCheck = (player: Player): boolean => {
  const allMoves = getAllValidMoves(player)
  return allMoves.some((move) => !doesMoveLeaveKingInCheck(move.from, move.to, move.piece))
}

/**
 * Get all possible moves for pawn
 * @param current current location of the pawn
 * @param type black or white piece
 * @returns array of possible move locations
 */
const isValidPawnMoves = (current: vector2, type: Player): vector2[] => {
  console.log(inverted)
  const direction = type === Player.black ? (inverted.value ? -1 : 1) : inverted.value ? 1 : -1
  const startRow = type === Player.white ? (inverted.value ? 1 : 6) : inverted.value ? 6 : 1
  const availableMoves: vector2[] = []
  // immutable
  const boardState = BoardState.value

  // Check if the current position is within the bounds of the board (kinda redundant but just in case)
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
  const res = canCastle(current, type)
  if (res) {
    availableMoves.push(res)
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
/**
 *
 * @param from Rook (left or right) NOT king
 */
const canCastle = (from: vector2, type: Player) => {
  if (hasAnyMoved(hasMoved.value)) {
    console.log('cant castle')
    return null
  }

  // if rook = left
  if (from.col === 0) {
    // boardstate range col king - rook (left or right) is empty
    for (let i = from.col + 1; i < 4; i++) {
      if (BoardState.value[from.row][i] != null) {
        console.log('cant castle')
        return false
      }
    }
  }
  if (from.col === 7) {
    for (let i = from.col - 1; i > 4; i--) {
      if (BoardState.value[from.row][i] != null) {
        console.log('cant castle')
        return false
      }
    }
  }

  // check if king is in check
  const checkStatus = inCheck.value
  if (checkStatus) {
    // Check for check for right player
    if (checkStatus === type) {
      console.log('cant castle')
      return false
    }
  }

  const toVector: vector2 = {
    row: from.row,
    // depends on from (rook / king)
    col: 4
  }
  return toVector
}

function hasCastled(from: vector2, to: vector2, piece: Piece): boolean {
  const { sendMove, sendTurn } = usePeerConnection()
  if (piece.type !== PieceType.ROOK) return false

  if (canCastle(from, piece.color)) {
    const rook = BoardState.value[from.row][from.col]
    const king = BoardState.value[to.row][to.col]
    BoardState.value[from.row][from.col] = null
    BoardState.value[to.row][to.col] = null
    // BoardState.value[to.row][to.col -1] = king
    const direction = from.col === 0 ? -1 : 1
    BoardState.value[to.row][to.col + direction] = rook
    BoardState.value[to.row][to.col + direction * 2] = king

    currentPlayer.value = currentPlayer.value === Player.white ? Player.black : Player.white // Switch turns
    sendTurn(currentPlayer.value)
    sendMove(
      { row: to.row, col: to.col },
      { row: to.row, col: to.col + direction * 2 },
      {
        color: piece.color,
        type: PieceType.KING
      }
    ) // Send the king move to the peer
    sendMove({ row: from.row, col: from.col }, { row: to.row, col: to.col + direction }, piece) // Send the rook to the peer
    return true
  }
  return false
}

export const useMovePiece = () => {
  return {
    movePiece
  }
}
