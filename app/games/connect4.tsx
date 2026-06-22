import { router } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';

import { AppText } from '../../src/components/AppText';
import { Button } from '../../src/components/Button';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { Screen } from '../../src/components/Screen';
import { Connect4Board } from '../../src/features/connect4/Connect4Board';
import { getConnect4DiscAssignments, getConnect4HeaderStatus } from '../../src/features/connect4/presentation';
import { useConnect4Session } from '../../src/features/connect4/useConnect4Session';
import { useAuth } from '../../src/providers/AuthProvider';
import { usePair } from '../../src/providers/PairProvider';

export default function Connect4Screen() {
  const { user } = useAuth();
  const { pair, partner } = usePair();
  const { width } = useWindowDimensions();

  const {
    canSelectColumn,
    confettiSeed,
    error,
    loading,
    playAgain,
    sendMove,
    session,
    stagedMove,
    stageColumn,
    submitting,
  } = useConnect4Session({
    currentUserId: user?.id,
    pairId: pair?.id,
  });

  const assignments = getConnect4DiscAssignments({
    currentUserId: user?.id,
    pairCreatedBy: pair?.createdBy,
    partnerFirstName: partner?.firstName,
    partnerUserId: partner?.id,
    session,
  });

  if (loading) {
    return <LoadingOverlay message="Loading Connect 4..." />;
  }

  return (
    <Screen scrollable>
      {assignments.didIWin && session?.status === 'finished' ? (
        <ConfettiCannon
          autoStart
          count={120}
          fadeOut
          fallSpeed={2600}
          key={confettiSeed}
          origin={{ x: width / 2, y: 0 }}
        />
      ) : null}

      <View style={styles.topBar}>
        <Button onPress={() => router.back()} variant="secondary">
          Back
        </Button>
      </View>

      <View style={styles.header}>
        <AppText variant="eyebrow">Play together</AppText>
        <AppText variant="title">Connect 4</AppText>
        <AppText color="muted">
          {getConnect4HeaderStatus({
            isMyTurn: assignments.isMyTurn,
            partnerFirstName: partner?.firstName,
            session,
            winnerBanner: assignments.winnerBanner,
          })}
        </AppText>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.playerPill}>
          <View style={[styles.playerDisc, { backgroundColor: assignments.myDiscColor }]} />
          <AppText>You</AppText>
        </View>
        <View style={styles.playerPill}>
          <View style={[styles.playerDisc, { backgroundColor: assignments.partnerDiscColor }]} />
          <AppText>{partner?.firstName || 'Partner'}</AppText>
        </View>
      </View>

      {error ? <AppText color="danger">{error}</AppText> : null}

      <Connect4Board
        canSelectColumn={canSelectColumn}
        myBoardValue={assignments.myBoardValue}
        myDiscColor={assignments.myDiscColor}
        onSelectColumn={stageColumn}
        partnerBoardValue={assignments.partnerBoardValue}
        partnerDiscColor={assignments.partnerDiscColor}
        session={session}
        stagedMove={stagedMove}
      />

      {stagedMove ? (
        <View style={styles.actionArea}>
          <Button disabled={!assignments.isMyTurn || submitting} onPress={sendMove}>
            {submitting ? 'Sending...' : 'Send'}
          </Button>
        </View>
      ) : null}

      <View style={styles.controlArea}>
        {session?.status === 'finished' ? (
          <Button disabled={submitting} onPress={playAgain}>
            Play again
          </Button>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionArea: {
    marginTop: 28,
  },
  controlArea: {
    gap: 12,
    marginTop: 14,
    paddingBottom: 24,
  },
  header: {
    gap: 8,
    paddingTop: 20,
  },
  playerDisc: {
    borderRadius: 8,
    height: 16,
    width: 16,
  },
  playerPill: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  topBar: {
    paddingTop: 12,
  },
});
