import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

type LoadingOverlayProps = {
  message?: string;
};

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color="#151515" />
      <AppText color="muted">{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#fbfaf7',
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    padding: 24,
  },
});
