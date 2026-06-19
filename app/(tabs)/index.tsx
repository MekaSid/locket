import { StyleSheet, View } from 'react-native';

import { AppText } from '../../src/components/AppText';
import { Avatar } from '../../src/components/Avatar';
import { GameCard } from '../../src/components/GameCard';
import { PhotoCard } from '../../src/components/PhotoCard';
import { Screen } from '../../src/components/Screen';
import { useAuth } from '../../src/providers/AuthProvider';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <Avatar label={user?.email ?? 'You'} />
        <View style={styles.heading}>
          <AppText variant="eyebrow">Private space</AppText>
          <AppText variant="title">Home</AppText>
          <AppText color="muted">Your shared photos and games will surface here.</AppText>
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="subtitle">Latest photo</AppText>
        <PhotoCard caption="Photo sharing will live here next." label="Preview" timestamp="Coming soon" />
      </View>

      <View style={styles.section}>
        <AppText variant="subtitle">Next game</AppText>
        <GameCard
          description="Daily photo prompts and a simple turn-based game can plug into this card."
          title="Game hub"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    paddingTop: 20,
  },
  heading: {
    flex: 1,
    gap: 4,
  },
  section: {
    gap: 12,
    marginTop: 28,
  },
});
