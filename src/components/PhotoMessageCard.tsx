import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

type PhotoMessageCardProps = {
  disabled?: boolean;
  onPress?: () => void;
  stateLabel: string;
  subtitle: string;
  title: string;
};

export function PhotoMessageCard({ disabled = false, onPress, stateLabel, subtitle, title }: PhotoMessageCardProps) {
  return (
    <Pressable
      disabled={disabled || !onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && !disabled && onPress ? styles.pressed : null]}
    >
      <View style={styles.iconWrap}>
        <View style={styles.iconCore} />
      </View>
      <View style={styles.content}>
        <AppText variant="subtitle">{title}</AppText>
        <AppText color="muted">{subtitle}</AppText>
      </View>
      <AppText color="muted" style={styles.stateLabel} variant="caption">
        {stateLabel}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#d9d9d9',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  iconCore: {
    backgroundColor: '#000000',
    borderRadius: 7,
    height: 14,
    width: 14,
  },
  iconWrap: {
    alignItems: 'center',
    borderColor: '#000000',
    borderRadius: 12,
    borderWidth: 2,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  pressed: {
    opacity: 0.78,
  },
  stateLabel: {
    textAlign: 'right',
  },
});
