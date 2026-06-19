import { Redirect } from 'expo-router';

import { LoadingOverlay } from '../src/components/LoadingOverlay';
import { useAuth } from '../src/providers/AuthProvider';

export default function IndexRoute() {
  const { initialized, session } = useAuth();

  if (!initialized) {
    return <LoadingOverlay message="Checking session..." />;
  }

  return <Redirect href={session ? '/home' : '/login'} />;
}
