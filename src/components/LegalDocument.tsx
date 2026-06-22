import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { DetailScreen } from './DetailScreen';

export function LegalDocument({
  children,
  description,
  effectiveDate,
  title,
}: PropsWithChildren<{
  description: string;
  effectiveDate: string;
  title: string;
}>) {
  return (
    <DetailScreen description={description} title={title}>
      <View style={styles.header}>
        <AppText variant="eyebrow">Legal</AppText>
        <AppText color="muted" variant="caption">
          Effective date: {effectiveDate}
        </AppText>
      </View>
      <View style={styles.sections}>{children}</View>
    </DetailScreen>
  );
}

export function LegalSection({
  body,
  title,
}: {
  body: string;
  title: string;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="subtitle">{title}</AppText>
      <AppText color="muted">{body}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  section: {
    backgroundColor: '#ffffff',
    borderColor: '#d9d9d9',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  sections: {
    gap: 14,
  },
});
