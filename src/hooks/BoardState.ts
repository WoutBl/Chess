import { ref } from 'vue'
import { Player, type vector2 } from '@/hooks/MovePiece'

export type Piece = {
  type: PieceType
  color: Player
}

export enum PieceType {
  PAWN = 'pawn',
  ROOK = 'rook',
  KNIGHT = 'knight',
  BISHOP = 'bishop',
  QUEEN = 'queen',
  KING = 'king'
}

export type Board = (Piece | null)[][]

const initialBoard = [
  [
    { type: 'rook', color: Player.black },
    { type: 'knight', color: Player.black },
    { type: 'bishop', color: Player.black },
    { type: 'queen', color: Player.black },
    { type: 'king', color: Player.black },
    { type: 'bishop', color: Player.black },
    { type: 'knight', color: Player.black },
    { type: 'rook', color: Player.black }
  ],
  Array(8)
    .fill(null)
    .map(() => ({ type: 'pawn', color: Player.black })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8)
    .fill(null)
    .map(() => ({ type: 'pawn', color: Player.white })),
  [
    { type: 'rook', color: Player.white },
    { type: 'knight', color: Player.white },
    { type: 'bishop', color: Player.white },
    { type: 'queen', color: Player.white },
    { type: 'king', color: Player.white },
    { type: 'bishop', color: Player.white },
    { type: 'knight', color: Player.white },
    { type: 'rook', color: Player.white }
  ]
]

export const BoardState = ref<Board>(initialBoard)
export const currentPlayer = ref<Player>(Player.white)
export const gameFinished = ref<boolean>(false)

// export const AvailableMoves
export const AvailableMovesCoordinates = ref<vector2[]>()