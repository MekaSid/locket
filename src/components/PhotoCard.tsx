import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

type PhotoCardProps = {
  caption: string;
  label: string;
  timestamp: string;
};

export function PhotoCard({ caption, label, timestamp }: PhotoCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.placeholder}>
        <AppText color="muted" variant="caption">
          {label}
        </AppText>
      </View>
      <View style={styles.content}>
        <AppText>{caption}</AppText>
        <AppText color="muted" variant="caption">
          {timestamp}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#e2ded7',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  placeholder: {
    alignItems: 'center',
    aspectRatio: 4 / 3,
    backgroundColor: '#ebe2d6',
    justifyContent: 'center',
  },
  content: {
    gap: 6,
    padding: 14,
  },
});
