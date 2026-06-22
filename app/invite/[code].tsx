import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../../src/components/AppText';
import { Button } from '../../src/components/Button';
import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { Screen } from '../../src/components/Screen';
import { normalizeInviteCode } from '../../src/lib/pairs';
import { useAuth } from '../../src/providers/AuthProvider';
import { usePair } from '../../src/providers/PairProvider';

export default function InviteScreen() {
  const params = useLocalSearchParams<{ code?: string | string[] }>();
  const { initialized: authInitialized, session, signOut } = useAuth();
  const pairState = usePair();
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const inviteCode = useMemo(() => {
    const rawCode = Array.isArray(params.code) ? params.code[0] : params.code;
    return normalizeInviteCode(rawCode ?? '');
  }, [params.code]);

  useEffect(() => {
    if (inviteCode) {
      pairState.setPendingInviteCodeFromLink(inviteCode);
    }
  }, [inviteCode, pairState]);

  if (!authInitialized || !pairState.initialized) {
    return <LoadingOverlay message="Opening invite..." />;
  }

  if (!inviteCode) {
    return (
      <Screen>
        <View style={styles.content}>
          <AppText variant="title">Invalid invite</AppText>
          <AppText color="muted">This invite link is missing a code.</AppText>
          <Button onPress={() => router.replace('/')}>Go back</Button>
        </View>
      </Screen>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (pairState.pair?.status === 'active') {
    return <Redirect href="/(tabs)" />;
  }

  const handleJoin = async () => {
    setError(null);
    setIsJoining(true);

    const result = await pairState.joinWithCode(inviteCode);

    if (result.error) {
      setError(result.error);
    } else {
      router.replace('/');
    }

    setIsJoining(false);
  };

  const handleNotNow = async () => {
    await pairState.clearPendingInviteCode();
    router.replace('/pairing');
  };

  const handleSignOut = async () => {
    await pairState.clearPendingInviteCode();
    await signOut();
  };

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.header}>
          <AppText variant="eyebrow">Invite link</AppText>
          <AppText variant="title">Pair accounts?</AppText>
          <AppText color="muted">
            Confirm this invite to link your account with your partner for private photos and games.
          </AppText>
        </View>

        <View style={styles.codeBox}>
          <AppText variant="eyebrow">Code</AppText>
          <AppText variant="title">{inviteCode}</AppText>
        </View>

        {error ? <AppText color="danger">{error}</AppText> : null}

        <View style={styles.actions}>
          <Button disabled={isJoining} loading={isJoining} onPress={handleJoin}>
            Confirm pairing
          </Button>
          <Button disabled={isJoining} onPress={handleNotNow} variant="ghost">
            Not now
          </Button>
          <Button disabled={isJoining} onPress={handleSignOut} variant="ghost">
            Sign out
          </Button>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 24,
    justifyContent: 'center',
  },
  header: {
    gap: 8,
  },
  codeBox: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    gap: 4,
    padding: 16,
  },
  actions: {
    gap: 12,
  },
});
