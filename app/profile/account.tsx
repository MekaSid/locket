import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppText } from '../../src/components/AppText';
import { Button } from '../../src/components/Button';
import { DetailScreen } from '../../src/components/DetailScreen';
import { deleteMyAccount, endCurrentPair } from '../../src/lib/pairs';
import { useAuth } from '../../src/providers/AuthProvider';
import { usePair } from '../../src/providers/PairProvider';

type BusyAction = 'delete-account' | 'sign-out' | 'unpair' | null;

export default function AccountScreen() {
  const { signOut } = useAuth();
  const pairState = usePair();
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSignOut = async () => {
    setBusyAction('sign-out');
    await signOut();
  };

  const handleUnpair = () => {
    Alert.alert(
      'Unpair account',
      'This will disconnect both accounts and end your current pair.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unpair',
          style: 'destructive',
          onPress: async () => {
            setBusyAction('unpair');
            setError(null);
            setMessage(null);

            const result = await endCurrentPair();

            if (result.error) {
              setError(result.error);
              setBusyAction(null);
              return;
            }

            await pairState.clearPendingInviteCode();
            await pairState.refreshPair();
            setMessage('Your pair has been ended.');
            setBusyAction(null);
            router.replace('/pairing');
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account, end your current pair, and remove your access to this app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: async () => {
            setBusyAction('delete-account');
            setError(null);
            setMessage(null);

            const result = await deleteMyAccount();

            if (result.error) {
              setError(result.error);
              setBusyAction(null);
              return;
            }

            await pairState.clearPendingInviteCode();
            await signOut();
          },
        },
      ],
    );
  };

  return (
    <DetailScreen description="Session and relationship actions for this account." title="Account">
      <View style={styles.panel}>
        <AppText color="muted">
          Manage sign out, pairing state, and permanent account removal.
        </AppText>
        {error ? <AppText color="danger">{error}</AppText> : null}
        {message ? <AppText color="success">{message}</AppText> : null}
        <View style={styles.stack}>
          <Button disabled={busyAction !== null} loading={busyAction === 'sign-out'} onPress={handleSignOut} variant="secondary">
            Sign out
          </Button>
          <Button
            disabled={busyAction !== null || !pairState.pair}
            loading={busyAction === 'unpair'}
            onPress={handleUnpair}
            variant="secondary"
          >
            Unpair
          </Button>
          <Button disabled={busyAction !== null} loading={busyAction === 'delete-account'} onPress={handleDeleteAccount} variant="secondary">
            Delete account
          </Button>
        </View>
      </View>
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#ffffff',
    borderColor: '#d9d9d9',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  stack: {
    gap: 10,
  },
});
