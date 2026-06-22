import { router } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Screen } from './Screen';

export function DetailScreen({
  children,
  description,
  title,
}: PropsWithChildren<{
  description?: string;
  title: string;
}>) {
  return (
    <Screen scrollable>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
            <AppText variant="subtitle">‹ Back</AppText>
          </Pressable>
          <View style={styles.headerCopy}>
            <AppText variant="title">{title}</AppText>
            {description ? <AppText color="muted">{description}</AppText> : null}
          </View>
        </View>
        <View style={styles.body}>{children}</View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  body: {
    gap: 14,
  },
  content: {
    gap: 24,
    paddingTop: 12,
  },
  header: {
    gap: 12,
  },
  headerCopy: {
    gap: 8,
  },
  pressed: {
    opacity: 0.76,
  },
});
