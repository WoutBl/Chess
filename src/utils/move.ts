import type { hasMovedType } from '@/hooks/BoardState'

export function hasAnyMoved(hasMoved: hasMovedType): boolean {
  const { black, white } = hasMoved;

  // Check all values in the black object
  for (const key in black) {
    //@ts-ignore
    if (black[key]) {
      return true;
    }
  }

  // Check all values in the white object
  for (const key in white) {
    //@ts-ignore
    if (white[key]) {
      return true;
    }
  }

  // Return false if no value is true
  return false;
}
