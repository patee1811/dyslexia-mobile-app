import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  style?: ViewStyle;
};

export default function SectionCard({ title, subtitle, children, style }: Props) {
  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 10,
    shadowColor: '#70482E',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  title: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
  },
});
