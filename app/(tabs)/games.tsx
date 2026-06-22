import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '../../src/components/AppText';
import { GameCard } from '../../src/components/GameCard';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { Screen } from '../../src/components/Screen';
import type { Connect4Session } from '../../src/lib/connect4';
import { getOrCreateConnect4Session, subscribeToConnect4Session } from '../../src/lib/games';
import { getConnect4HeaderStatus } from '../../src/features/connect4/presentation';
import { useAuth } from '../../src/providers/AuthProvider';
import { usePair } from '../../src/providers/PairProvider';

export default function GamesScreen() {
  const { user } = useAuth();
  const { pair, partner } = usePair();
  const [loading, setLoading] = useState(true);
  const [connect4Session, setConnect4Session] = useState<Connect4Session | null>(null);

  const loadGameState = useCallback(async () => {
    if (!pair?.id) {
      setConnect4Session(null);
      setLoading(false);
      return;
    }

    const result = await getOrCreateConnect4Session(pair.id);
    setConnect4Session(result.data);
    setLoading(false);
  }, [pair?.id]);

  useEffect(() => {
    let isMounted = true;

    async function loadInitialState() {
      if (!pair?.id) {
        if (isMounted) {
          setConnect4Session(null);
          setLoading(false);
        }
        return;
      }

      const result = await getOrCreateConnect4Session(pair.id);

      if (!isMounted) {
        return;
      }

      setConnect4Session(result.data);
      setLoading(false);
    }

    loadInitialState();

    return () => {
      isMounted = false;
    };
  }, [pair?.id]);

  useFocusEffect(
    useCallback(() => {
      loadGameState();
    }, [loadGameState]),
  );

  useEffect(() => {
    if (!pair?.id || !connect4Session?.id) {
      return undefined;
    }

    const subscription = subscribeToConnect4Session(connect4Session.id, async () => {
      const result = await getOrCreateConnect4Session(pair.id);
      setConnect4Session(result.data);
    });

    return () => subscription.unsubscribe();
  }, [connect4Session?.id, pair?.id]);

  if (loading) {
    return <LoadingOverlay message="Loading games..." />;
  }

  const isMyTurn = connect4Session?.status === 'active' && connect4Session.currentTurnUserId === user?.id;
  const isPartnerTurn = connect4Session?.status === 'active' && connect4Session.currentTurnUserId === partner?.id;
  const sectionTitle = isMyTurn ? 'Your turn' : isPartnerTurn ? `${partner?.firstName || 'Partner'}'s turn` : 'Games';
  const connect4Status = connect4Session?.status === 'finished'
    ? 'Round finished. Open the board to review it.'
    : getConnect4HeaderStatus({
        isMyTurn,
        partnerFirstName: partner?.firstName,
        session: connect4Session,
        winnerBanner: null,
      });

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <AppText variant="eyebrow">Play together</AppText>
        <AppText variant="title">Games</AppText>
        <AppText color="muted">Open a game, play a round, then jump back here to pick something else.</AppText>
      </View>

      <View style={styles.section}>
        <AppText variant="subtitle">{sectionTitle}</AppText>
        <View style={styles.list}>
          <View style={styles.gameEntry}>
            <GameCard
              description="A synced board with head-to-head play."
              emphasis={isMyTurn ? 'attention' : 'default'}
              onPress={() => router.push('/games/connect4')}
              status={connect4Status}
              title="Connect 4"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="subtitle">More games</AppText>
        <View style={styles.list}>
          <View style={styles.gameEntry}>
            <GameCard
              description="Local practice mode with swipe-up flick controls and table physics."
              onPress={() => router.push('/games/cup-pong')}
              status="Local v1"
              title="Cup Pong"
            />
          </View>
          <View style={styles.gameEntry}>
            <GameCard
              description="Reserved for the next turn-based game after Connect 4 is stable."
              emphasis="muted"
              status="Coming soon"
              title="Coming next"
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gameEntry: {
    gap: 12,
  },
  header: {
    gap: 8,
    paddingTop: 20,
  },
  list: {
    gap: 18,
    marginTop: 16,
  },
  section: {
    gap: 8,
    marginTop: 28,
  },
});
