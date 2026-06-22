export const CUP_PONG_BALL_RADIUS = 12;
export const CUP_PONG_CUP_RADIUS = 24;
export const CUP_PONG_BOARD_HEIGHT = 560;
export const CUP_PONG_TABLE_PADDING = 18;

export type CupPongCup = {
  id: string;
  x: number;
  y: number;
};

export function buildCupPongRack(boardWidth: number): CupPongCup[] {
  const centerX = boardWidth / 2;
  const rowSpacing = 46;
  const cupSpacing = 52;
  const startY = 92;

  return [
    { id: 'cup-1', x: centerX, y: startY },
    { id: 'cup-2', x: centerX - (cupSpacing / 2), y: startY + rowSpacing },
    { id: 'cup-3', x: centerX + (cupSpacing / 2), y: startY + rowSpacing },
    { id: 'cup-4', x: centerX - cupSpacing, y: startY + (rowSpacing * 2) },
    { id: 'cup-5', x: centerX, y: startY + (rowSpacing * 2) },
    { id: 'cup-6', x: centerX + cupSpacing, y: startY + (rowSpacing * 2) },
  ];
}
