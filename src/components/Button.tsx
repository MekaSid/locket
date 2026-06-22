import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { AppText } from './AppText';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type ButtonProps = PropsWithChildren<{
  disabled?: boolean;
  loading?: boolean;
  onPress: () => void;
  variant?: ButtonVariant;
}>;

export function Button({ children, disabled, loading, onPress, variant = 'primary' }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#ffffff' : '#000000'} />
      ) : (
        <AppText color={variant === 'primary' ? 'inverse' : 'default'} style={styles.label}>
          {children}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: 8,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primary: {
    backgroundColor: '#000000',
  },
  secondary: {
    backgroundColor: '#f2f2f2',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.76,
  },
  label: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
