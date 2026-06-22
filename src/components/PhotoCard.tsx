import { Image, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

type PhotoCardProps = {
  caption: string;
  imageUrl?: string | null;
  label: string;
  timestamp: string;
};

export function PhotoCard({ caption, imageUrl, label, timestamp }: PhotoCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.placeholder}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <AppText color="muted" variant="caption">
            {label}
          </AppText>
        )}
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
    borderColor: '#d9d9d9',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  placeholder: {
    alignItems: 'center',
    aspectRatio: 4 / 3,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
  },
  content: {
    gap: 6,
    padding: 14,
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
