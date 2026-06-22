import type { GestureResponderHandlers } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../../components/AppText';
import { CUP_PONG_BALL_RADIUS, CUP_PONG_CUP_RADIUS, CUP_PONG_TABLE_PADDING, type CupPongCup } from './constants';

type CupPongBoardProps = {
  ballPosition: { x: number; y: number };
  boardHeight: number;
  boardWidth: number;
  cups: CupPongCup[];
  dragIndicator: { x: number; y: number } | null;
  message: string;
  panHandlers: GestureResponderHandlers;
  remainingCups: number;
  shotsTaken: number;
};

export function CupPongBoard({
  ballPosition,
  boardHeight,
  boardWidth,
  cups,
  dragIndicator,
  message,
  panHandlers,
  remainingCups,
  shotsTaken,
}: CupPongBoardProps) {
  const guide = dragIndicator ? buildGuide(ballPosition, dragIndicator) : null;

  return (
    <View style={styles.wrap}>
      <View style={styles.statusRow}>
        <View style={styles.metric}>
          <AppText variant="caption">Cups left</AppText>
          <AppText variant="subtitle">{remainingCups}</AppText>
        </View>
        <View style={styles.metric}>
          <AppText variant="caption">Shots</AppText>
          <AppText variant="subtitle">{shotsTaken}</AppText>
        </View>
      </View>

      <View
        {...panHandlers}
        style={[
          styles.board,
          {
            height: boardHeight,
            width: boardWidth,
          },
        ]}
      >
        <View style={styles.innerRail} />

        {cups.map((cup) => (
          <View
            key={cup.id}
            style={[
              styles.cup,
              {
                left: cup.x - CUP_PONG_CUP_RADIUS,
                top: cup.y - CUP_PONG_CUP_RADIUS,
              },
            ]}
          >
            <View style={styles.cupHole} />
          </View>
        ))}

        {guide ? (
          <View
            style={[
              styles.guide,
              {
                left: guide.left,
                top: guide.top,
                transform: [{ rotate: `${guide.angle}rad` }],
                width: guide.length,
              },
            ]}
          />
        ) : null}

        <View
          style={[
            styles.ball,
            {
              left: ballPosition.x - CUP_PONG_BALL_RADIUS,
              top: ballPosition.y - CUP_PONG_BALL_RADIUS,
            },
          ]}
        />
      </View>

      <AppText color="muted">{message}</AppText>
    </View>
  );
}

function buildGuide(ballPosition: { x: number; y: number }, dragIndicator: { x: number; y: number }) {
  const startX = ballPosition.x;
  const startY = ballPosition.y;
  const endX = dragIndicator.x;
  const endY = dragIndicator.y;
  const deltaX = endX - startX;
  const deltaY = endY - startY;

  return {
    angle: Math.atan2(deltaY, deltaX),
    left: startX,
    length: Math.hypot(deltaX, deltaY),
    top: startY - 1,
  };
}

const styles = StyleSheet.create({
  ball: {
    backgroundColor: '#111111',
    borderRadius: CUP_PONG_BALL_RADIUS,
    height: CUP_PONG_BALL_RADIUS * 2,
    position: 'absolute',
    width: CUP_PONG_BALL_RADIUS * 2,
    zIndex: 3,
  },
  board: {
    backgroundColor: '#16395c',
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
  },
  cup: {
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderColor: '#d5d5d5',
    borderRadius: CUP_PONG_CUP_RADIUS,
    borderWidth: 2,
    height: CUP_PONG_CUP_RADIUS * 2,
    justifyContent: 'center',
    position: 'absolute',
    width: CUP_PONG_CUP_RADIUS * 2,
    zIndex: 2,
  },
  cupHole: {
    backgroundColor: '#1c2630',
    borderRadius: CUP_PONG_CUP_RADIUS - 7,
    height: (CUP_PONG_CUP_RADIUS - 7) * 2,
    width: (CUP_PONG_CUP_RADIUS - 7) * 2,
  },
  guide: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 1,
    height: 2,
    position: 'absolute',
    zIndex: 1,
  },
  innerRail: {
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    borderWidth: 2,
    bottom: CUP_PONG_TABLE_PADDING,
    left: CUP_PONG_TABLE_PADDING,
    position: 'absolute',
    right: CUP_PONG_TABLE_PADDING,
    top: CUP_PONG_TABLE_PADDING,
  },
  metric: {
    gap: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wrap: {
    gap: 12,
    marginTop: 24,
  },
});
