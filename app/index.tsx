import { Redirect } from 'expo-router';

import { LoadingOverlay } from '../src/components/LoadingOverlay';
import { useAuth } from '../src/providers/AuthProvider';
import { usePair } from '../src/providers/PairProvider';

export default function IndexRoute() {
  const { initialized, session } = useAuth();
  const pairState = usePair();

  if (!initialized || !pairState.initialized) {
    return <LoadingOverlay message="Checking session..." />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (pairState.pendingInviteCodeFromLink) {
    return <Redirect href={`/invite/${pairState.pendingInviteCodeFromLink}`} />;
  }

  return <Redirect href={pairState.pair?.status === 'active' ? '/(tabs)' : '/pairing'} />;
}
