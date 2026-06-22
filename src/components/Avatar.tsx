import { Image, StyleSheet, View } from 'react-native';
import { useState } from 'react';

import { AppText } from './AppText';

type AvatarProps = {
  imageUrl?: string | null;
  label: string;
  size?: number;
};

export function Avatar({ imageUrl, label, size = 48 }: AvatarProps) {
  const initial = label.trim().charAt(0).toUpperCase() || '?';
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const shouldShowImage = Boolean(imageUrl && failedUrl !== imageUrl);

  return (
    <View style={[styles.avatar, { borderRadius: size / 2, height: size, width: size }]}>
      {shouldShowImage ? (
        <Image
          onError={() => setFailedUrl(imageUrl ?? null)}
          source={{ uri: imageUrl as string }}
          style={styles.image}
        />
      ) : (
        <AppText color="inverse" variant="subtitle">
          {initial}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: '#000000',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
