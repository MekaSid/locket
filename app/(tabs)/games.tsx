import { StyleSheet, View } from 'react-native';

import { AppText } from '../../src/components/AppText';
import { GameCard } from '../../src/components/GameCard';
import { Screen } from '../../src/components/Screen';

export default function GamesScreen() {
  return (
    <Screen scrollable>
      <View style={styles.header}>
        <AppText variant="eyebrow">Play together</AppText>
        <AppText variant="title">Games</AppText>
        <AppText color="muted">Photo prompts and turn-based games will live here.</AppText>
      </View>

      <View style={styles.list}>
        <GameCard
          description="Answer the same prompt with a photo, then reveal both submissions."
          title="Daily prompt"
        />
        <GameCard description="A simple first turn-based game for realtime sync testing." title="Tic-tac-toe" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
    paddingTop: 20,
  },
  list: {
    gap: 14,
    marginTop: 28,
  },
});
