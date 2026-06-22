import { Pressable, StyleSheet, View } from 'react-native';

import { CONNECT4_COLUMNS, CONNECT4_ROWS, getCell, type Connect4Session } from '../../lib/connect4';

const CELL_SIZE = 42;
const CELL_GAP = 6;
const BOARD_PADDING = 10;
const BOARD_WIDTH = (CELL_SIZE * CONNECT4_COLUMNS) + (CELL_GAP * (CONNECT4_COLUMNS - 1)) + (BOARD_PADDING * 2);
const BOARD_HEIGHT = (CELL_SIZE * CONNECT4_ROWS) + (CELL_GAP * (CONNECT4_ROWS - 1)) + (BOARD_PADDING * 2);

type StagedMove = {
  column: number;
  row: number;
};

type Connect4BoardProps = {
  canSelectColumn: (column: number) => boolean;
  myBoardValue: 1 | 2;
  myDiscColor: string;
  onSelectColumn: (column: number) => void;
  partnerBoardValue: 1 | 2;
  partnerDiscColor: string;
  session: Connect4Session | null;
  stagedMove: StagedMove | null;
};

export function Connect4Board({
  canSelectColumn,
  myBoardValue,
  myDiscColor,
  onSelectColumn,
  partnerBoardValue,
  partnerDiscColor,
  session,
  stagedMove,
}: Connect4BoardProps) {
  return (
    <View style={styles.boardShell}>
      <View style={styles.board}>
        <View pointerEvents="box-none" style={styles.columnHitAreaRow}>
          {Array.from({ length: CONNECT4_COLUMNS }, (_, column) => {
            const selected = stagedMove?.column === column;

            return (
              <Pressable
                disabled={!canSelectColumn(column)}
                key={column}
                onPress={() => onSelectColumn(column)}
                style={[styles.columnHitArea, selected ? styles.columnHitAreaSelected : null]}
              />
            );
          })}
        </View>

        {Array.from({ length: CONNECT4_ROWS }, (_, row) => (
          <View key={row} style={styles.row}>
            {Array.from({ length: CONNECT4_COLUMNS }, (_, column) => {
              const value = session ? getCell(session.board, row, column) : 0;
              const isPreviewCell = stagedMove?.row === row && stagedMove.column === column && value === 0;
              const discColor =
                value === myBoardValue
                  ? myDiscColor
                  : value === partnerBoardValue
                    ? partnerDiscColor
                    : isPreviewCell
                      ? myDiscColor
                      : '#f2f2f2';

              return (
                <View key={`${row}-${column}`} style={styles.slot}>
                  <View style={[styles.disc, { backgroundColor: discColor }]} />
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: '#1a2c52',
    borderRadius: 16,
    gap: CELL_GAP,
    minHeight: BOARD_HEIGHT,
    padding: BOARD_PADDING,
    width: BOARD_WIDTH,
  },
  boardShell: {
    gap: 12,
    marginTop: 24,
  },
  columnHitArea: {
    flex: 1,
  },
  columnHitAreaRow: {
    bottom: 0,
    flexDirection: 'row',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 4,
  },
  columnHitAreaSelected: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  disc: {
    borderRadius: CELL_SIZE / 2,
    height: CELL_SIZE,
    width: CELL_SIZE,
  },
  row: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },
  slot: {
    alignItems: 'center',
    backgroundColor: '#0c1730',
    borderRadius: CELL_SIZE / 2,
    height: CELL_SIZE,
    justifyContent: 'center',
    width: CELL_SIZE,
  },
});
