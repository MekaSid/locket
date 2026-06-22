import { router } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppText } from '../../src/components/AppText';
import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { CupPongBoard } from '../../src/features/cupPong/CupPongBoard';
import { CUP_PONG_TABLE_PADDING } from '../../src/features/cupPong/constants';
import { useCupPongGame } from '../../src/features/cupPong/useCupPongGame';

export default function CupPongScreen() {
  const { width } = useWindowDimensions();
  const boardWidth = Math.max(280, width - (CUP_PONG_TABLE_PADDING * 2) - 12);
  const { ballPosition, boardHeight, cups, dragIndicator, message, panHandlers, remainingCups, resetRound, shotsTaken } =
    useCupPongGame({ boardWidth });

  return (
    <Screen scrollable>
      <View style={styles.topBar}>
        <Button onPress={() => router.back()} variant="secondary">
          Back
        </Button>
      </View>

      <View style={styles.header}>
        <AppText variant="eyebrow">Practice mode</AppText>
        <AppText variant="title">Cup Pong</AppText>
        <AppText color="muted">Keep the ball on the table, swipe upward, and drop it into the cups.</AppText>
      </View>

      <CupPongBoard
        ballPosition={ballPosition}
        boardHeight={boardHeight}
        boardWidth={boardWidth}
        cups={cups}
        dragIndicator={dragIndicator}
        message={message}
        panHandlers={panHandlers}
        remainingCups={remainingCups}
        shotsTaken={shotsTaken}
      />

      <View style={styles.actions}>
        <Button onPress={resetRound} variant="secondary">
          Reset rack
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: 24,
    paddingBottom: 24,
  },
  header: {
    gap: 8,
    paddingTop: 20,
  },
  topBar: {
    paddingTop: 12,
  },
});
