import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';

import { AppText } from '../src/components/AppText';
import { Button } from '../src/components/Button';
import { LoadingOverlay } from '../src/components/LoadingOverlay';
import { Screen } from '../src/components/Screen';
import { TextField } from '../src/components/TextField';
import { buildInviteLink } from '../src/lib/pairs';
import { useAuth } from '../src/providers/AuthProvider';
import { usePair } from '../src/providers/PairProvider';

export default function PairingScreen() {
  const { initialized: authInitialized, session, signOut } = useAuth();
  const pairState = usePair();
  const [manualCode, setManualCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  if (!authInitialized || !pairState.initialized) {
    return <LoadingOverlay message="Checking pairing..." />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (pairState.pair?.status === 'active') {
    return <Redirect href="/(tabs)" />;
  }

  const inviteLink = pairState.pendingInvite ? buildInviteLink(pairState.pendingInvite.code) : null;

  const handleCreateInvite = async () => {
    setError(null);
    setMessage(null);
    setIsCreating(true);

    const result = await pairState.createInvite();

    if (result.error) {
      setError(result.error);
    } else {
      setMessage('Invite ready. Share it with your partner.');
    }

    setIsCreating(false);
  };

  const handleShareInvite = async () => {
    if (!pairState.pendingInvite || !inviteLink) {
      return;
    }

    await Share.share({
      message: `Join me on Locket: ${inviteLink}`,
      url: inviteLink,
    });
  };

  const handleJoin = async () => {
    setError(null);
    setMessage(null);
    setIsJoining(true);

    const result = await pairState.joinWithCode(manualCode);

    if (result.error) {
      setError(result.error);
    } else {
      router.replace('/');
    }

    setIsJoining(false);
  };

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <AppText variant="eyebrow">Pair accounts</AppText>
        <AppText variant="title">Link with your partner</AppText>
        <AppText color="muted">
          Create an invite link or enter the one they sent you. Once linked, photos and games stay scoped to
          this pair.
        </AppText>
      </View>

      <View style={styles.panel}>
        <AppText variant="subtitle">Invite your partner</AppText>
        {pairState.pendingInvite ? (
          <>
            <View style={styles.codeBox}>
              <AppText variant="eyebrow">Invite code</AppText>
              <AppText variant="title">{pairState.pendingInvite.code}</AppText>
              <AppText color="muted" variant="caption">
                Expires {formatExpiry(pairState.pendingInvite.expiresAt)}
              </AppText>
            </View>
            <Button onPress={handleShareInvite}>Share invite link</Button>
            <Button disabled={isCreating} loading={isCreating} onPress={handleCreateInvite} variant="secondary">
              Generate new link
            </Button>
          </>
        ) : (
          <Button disabled={isCreating} loading={isCreating} onPress={handleCreateInvite}>
            Create invite link
          </Button>
        )}
      </View>

      <View style={styles.panel}>
        <AppText variant="subtitle">Enter a code</AppText>
        <TextField
          autoCapitalize="characters"
          label="Partner invite code"
          maxLength={12}
          onChangeText={setManualCode}
          placeholder="ABC123"
          value={manualCode}
        />
        <Button disabled={isJoining} loading={isJoining} onPress={handleJoin} variant="secondary">
          Link accounts
        </Button>
      </View>

      {error ? <AppText color="danger">{error}</AppText> : null}
      {message ? <AppText color="success">{message}</AppText> : null}

      <View style={styles.footer}>
        <Button onPress={signOut} variant="secondary">
          Sign out
        </Button>
      </View>
    </Screen>
  );
}

function formatExpiry(expiresAt: string) {
  const date = new Date(expiresAt);

  if (Number.isNaN(date.getTime())) {
    return 'soon';
  }

  return date.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
    paddingTop: 20,
  },
  panel: {
    backgroundColor: '#ffffff',
    borderColor: '#d9d9d9',
    borderRadius: 8,
    borderWidth: 1,
    gap: 14,
    marginTop: 24,
    padding: 16,
  },
  codeBox: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    gap: 4,
    padding: 16,
  },
  footer: {
    marginTop: 24,
  },
});
