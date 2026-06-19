import { StyleSheet, View } from 'react-native';

import { AppText } from '../../src/components/AppText';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { useAuth } from '../../src/providers/AuthProvider';

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const email = user?.email ?? 'Signed in';

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.profile}>
          <Avatar label={email} />
          <View style={styles.heading}>
            <AppText variant="eyebrow">Account</AppText>
            <AppText variant="title">Profile</AppText>
            <AppText color="muted">{email}</AppText>
          </View>
        </View>

        <View style={styles.panel}>
          <AppText variant="subtitle">Widget-ready later</AppText>
          <AppText color="muted">
            Future iOS widgets can read a small shared snapshot from the app once the native WidgetKit extension is added.
          </AppText>
        </View>

        <Button onPress={signOut} variant="secondary">
          Sign out
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 28,
    paddingTop: 20,
  },
  profile: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  heading: {
    flex: 1,
    gap: 4,
  },
  panel: {
    backgroundColor: '#ffffff',
    borderColor: '#e2ded7',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
});
