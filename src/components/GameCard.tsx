import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';

type GameCardProps = {
  description: string;
  emphasis?: 'default' | 'attention' | 'muted';
  onPress?: () => void;
  status?: string;
  title: string;
};

export function GameCard({ description, emphasis = 'default', onPress, status, title }: GameCardProps) {
  const tone = toneStyles[emphasis];

  const content = (
    <>
      <AppText color={tone.titleColor} variant="subtitle">
        {title}
      </AppText>
      <AppText color={tone.bodyColor}>{description}</AppText>
      {status ? (
        <AppText color={tone.statusColor} style={styles.status} variant="caption">
          {status}
        </AppText>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={[styles.card, tone.card]}>
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.card, tone.card]}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderColor: '#d9d9d9',
    borderRadius: 8,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  status: {
    marginTop: 4,
  },
});

const toneStyleSheet = StyleSheet.create({
  attentionCard: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  defaultCard: {},
  mutedCard: {
    backgroundColor: '#f7f7f7',
    borderColor: '#e3e3e3',
  },
});

const toneStyles = {
  attention: {
    bodyColor: 'inverse' as const,
    card: toneStyleSheet.attentionCard,
    statusColor: 'inverse' as const,
    titleColor: 'inverse' as const,
  },
  default: {
    bodyColor: 'muted' as const,
    card: toneStyleSheet.defaultCard,
    statusColor: 'muted' as const,
    titleColor: 'default' as const,
  },
  muted: {
    bodyColor: 'muted' as const,
    card: toneStyleSheet.mutedCard,
    statusColor: 'muted' as const,
    titleColor: 'default' as const,
  },
} as const;
