import { StyleSheet, View } from 'react-native';

import { AppText } from '../src/components/AppText';
import { Avatar } from '../src/components/Avatar';
import { Button } from '../src/components/Button';
import { GameCard } from '../src/components/GameCard';
import { PhotoCard } from '../src/components/PhotoCard';
import { Screen } from '../src/components/Screen';
import { useAuth } from '../src/providers/AuthProvider';

export default function HomeScreen() {
  const { user, signOut } = useAuth();

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <View style={styles.identity}>
          <Avatar label={user?.email ?? 'You'} />
          <View style={styles.heading}>
            <AppText variant="eyebrow">Private space</AppText>
            <AppText variant="title">Home</AppText>
          </View>
        </View>
        <Button onPress={signOut} variant="secondary">
          Sign out
        </Button>
      </View>

      <View style={styles.section}>
        <AppText variant="subtitle">Photos</AppText>
        <PhotoCard
          caption="Photo sharing will live here next."
          label="Latest photo"
          timestamp="Coming soon"
        />
      </View>

      <View style={styles.section}>
        <AppText variant="subtitle">Games</AppText>
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
    gap: 18,
    paddingTop: 20,
  },
  identity: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
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
