import { Redirect, Tabs } from 'expo-router';

import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { useAuth } from '../../src/providers/AuthProvider';

export default function TabLayout() {
  const { initialized, session } = useAuth();

  if (!initialized) {
    return <LoadingOverlay message="Checking session..." />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#151515',
        tabBarInactiveTintColor: '#81786d',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5ded4',
          minHeight: 78,
          paddingBottom: 22,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="photos" options={{ title: 'Photos' }} />
      <Tabs.Screen name="games" options={{ title: 'Games' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
