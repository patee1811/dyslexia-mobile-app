import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  progress: number;
  fillColor?: string;
};

export default function ProgressBar({ progress, fillColor = colors.accent }: Props) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.max(0, Math.min(progress, 1)) * 100}%`, backgroundColor: fillColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#ECDDC6',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
