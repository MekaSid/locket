export const CONNECT4_COLUMNS = 7;
export const CONNECT4_ROWS = 6;

export type Connect4Cell = 0 | 1 | 2;
export type Connect4Board = Connect4Cell[];

export type Connect4Session = {
  board: Connect4Board;
  createdAt: string;
  currentTurnUserId: string;
  gameType: 'connect4';
  id: string;
  pairId: string;
  status: 'active' | 'finished';
  updatedAt: string;
  winnerUserId: string | null;
};

export function createEmptyBoard(): Connect4Board {
  return Array.from({ length: CONNECT4_ROWS * CONNECT4_COLUMNS }, () => 0 as Connect4Cell);
}

export function getCell(board: Connect4Board, row: number, column: number) {
  return board[(row * CONNECT4_COLUMNS) + column];
}

export function getAvailableRow(board: Connect4Board, column: number) {
  for (let row = CONNECT4_ROWS - 1; row >= 0; row -= 1) {
    if (getCell(board, row, column) === 0) {
      return row;
    }
  }

  return -1;
}

export function canPlay(board: Connect4Board, column: number) {
  return getAvailableRow(board, column) >= 0;
}
