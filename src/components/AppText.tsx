import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, type TextProps } from 'react-native';

type TextVariant = 'title' | 'subtitle' | 'body' | 'caption' | 'eyebrow';
type TextColor = 'default' | 'muted' | 'danger' | 'success' | 'inverse';

type AppTextProps = PropsWithChildren<
  TextProps & {
    color?: TextColor;
    variant?: TextVariant;
  }
>;

export function AppText({ children, color = 'default', style, variant = 'body', ...props }: AppTextProps) {
  return (
    <Text {...props} style={[styles.base, styles[variant], colors[color], style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: '#000000',
    fontSize: 16,
    letterSpacing: 0,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  body: {
    fontSize: 16,
    lineHeight: 23,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
});

const colors = StyleSheet.create({
  default: {
    color: '#000000',
  },
  muted: {
    color: '#666666',
  },
  danger: {
    color: '#000000',
  },
  success: {
    color: '#000000',
  },
  inverse: {
    color: '#ffffff',
  },
});
