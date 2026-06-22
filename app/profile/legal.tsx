import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '../../src/components/AppText';
import { DetailScreen } from '../../src/components/DetailScreen';

export default function LegalScreen() {
  return (
    <DetailScreen description="Privacy, terms, and data-use disclosures for the app." title="Legal">
      <View style={styles.stack}>
        <LegalLink
          description="What personal data the app stores, how media is handled, and retention expectations."
          onPress={() => router.push('/legal/privacy')}
          title="Privacy Policy"
        />
        <LegalLink
          description="Rules for using the app, account responsibilities, and service limitations."
          onPress={() => router.push('/legal/terms')}
          title="Terms & Conditions"
        />
        <LegalLink
          description="A shorter summary of how account, pairing, and media data flows through the app."
          onPress={() => router.push('/legal/data-use')}
          title="How Data Is Used"
        />
      </View>
    </DetailScreen>
  );
}

function LegalLink({
  description,
  onPress,
  title,
}: {
  description: string;
  onPress: () => void;
  title: string;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.link, pressed && styles.pressed]}>
      <View style={styles.copy}>
        <AppText variant="subtitle">{title}</AppText>
        <AppText color="muted">{description}</AppText>
      </View>
      <AppText variant="subtitle">›</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    gap: 4,
  },
  link: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d9d9d9',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  pressed: {
    opacity: 0.76,
  },
  stack: {
    gap: 14,
  },
});
