import { StyleSheet, View } from 'react-native';

import { AppText } from '../../src/components/AppText';
import { PhotoCard } from '../../src/components/PhotoCard';
import { Screen } from '../../src/components/Screen';

export default function PhotosScreen() {
  return (
    <Screen scrollable>
      <View style={styles.header}>
        <AppText variant="eyebrow">Camera roll</AppText>
        <AppText variant="title">Photos</AppText>
        <AppText color="muted">A private timeline for photos you send each other.</AppText>
      </View>

      <View style={styles.list}>
        <PhotoCard caption="The shared feed will appear here." label="Photo feed" timestamp="Coming soon" />
        <PhotoCard caption="Saved memories will use the same card layout." label="Memory" timestamp="Coming soon" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
    paddingTop: 20,
  },
  list: {
    gap: 14,
    marginTop: 28,
  },
});
