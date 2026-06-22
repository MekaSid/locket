import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '../src/providers/AuthProvider';
import { PairProvider } from '../src/providers/PairProvider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <PairProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </PairProvider>
    </AuthProvider>
  );
}
