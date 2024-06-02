<template>
  <div v-if="piece" class="piece" draggable="false">
    <img :src="getPieceImage(piece)" :alt="piece.type" class="piece-image" :draggable="drag" />
  </div>
</template>

<script setup lang="ts">
import type { Piece } from '@/hooks/BoardState'
import { computed, type PropType } from 'vue'


const props = defineProps({
  piece: {
    type: Object as PropType<Piece | null>,
    required: false,
  },
  cursor: String,
  drag: Boolean
});

const getPieceImage = (piece: Piece | null): string => {
  if (!piece) return '';

  const pieceImages: { [key: string]: string } = {
    'pawn_white': 'White/Pawn.png',
    'rook_white': 'White/Rook.png',
    'knight_white': 'White/Knight.png',
    'bishop_white': 'White/Bishop.png',
    'queen_white': 'White/Queen.png',
    'king_white': 'White/King.png',
    'pawn_black': 'Black/Pawn.png',
    'rook_black': 'Black/Rook.png',
    'knight_black': 'Black/Knight.png',
    'bishop_black': 'Black/Bishop.png',
    'queen_black': 'Black/Queen.png',
    'king_black': 'Black/King.png',
  };

  return pieceImages[`${piece.type}_${piece.color}`] || '';
};


</script>

<style scoped>
.movable {
  background-color: hotpink !important;
}
.piece {
  user-select: none;
  cursor: v-bind(cursor)
}
.piece-image {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 0.5rem black);
}
</style>
