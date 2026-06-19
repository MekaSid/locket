import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

type AvatarProps = {
  label: string;
};

export function Avatar({ label }: AvatarProps) {
  const initial = label.trim().charAt(0).toUpperCase() || '?';

  return (
    <View style={styles.avatar}>
      <AppText color="inverse" variant="subtitle">
        {initial}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: '#3a6ea5',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
});
