import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

type GameCardProps = {
  description: string;
  title: string;
};

export function GameCard({ description, title }: GameCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <AppText variant="caption">Turn-based</AppText>
      </View>
      <AppText variant="subtitle">{title}</AppText>
      <AppText color="muted">{description}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#eef4f0',
    borderColor: '#d7e2da',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dce8e0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});
