import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

import { LoadingOverlay } from '../../src/components/LoadingOverlay';
import { useAuth } from '../../src/providers/AuthProvider';
import { usePair } from '../../src/providers/PairProvider';

export default function TabLayout() {
  const { initialized, session } = useAuth();
  const pairState = usePair();

  if (!initialized || !pairState.initialized) {
    return <LoadingOverlay message="Checking session..." />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  if (pairState.pair?.status !== 'active') {
    return <Redirect href="/pairing" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#8a8a8a',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e5e5',
          minHeight: 78,
          paddingBottom: 22,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="home-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="photos"
        options={{
          title: 'Photos',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="images-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: 'Games',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="game-controller-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="person-circle-outline" size={size} />,
        }}
      />
    </Tabs>
  );
}
