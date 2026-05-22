import React from 'react';
import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';
import type { ReaderFont } from '../../types';
import type { ReaderPreferences } from '../practice/types';

type Props = {
  text: string;
  preferences: ReaderPreferences;
  size?: 'word' | 'sentence' | 'body';
  style?: StyleProp<TextStyle>;
};

function getReaderFontFamily(font: ReaderFont) {
  if (font === 'serif') {
    return 'serif';
  }

  if (font === 'mono') {
    return 'monospace';
  }

  return undefined;
}

export default function ReadableText({ text, preferences, size = 'body', style }: Props) {
  const baseSize = size === 'sentence' ? 26 : size === 'word' ? 22 : 17;
  const baseLineHeight = size === 'sentence' ? 38 : size === 'word' ? 30 : 25;

  return (
    <Text
      style={[
        styles.text,
        {
          fontFamily: getReaderFontFamily(preferences.readerFont),
          fontSize: baseSize * preferences.fontScale,
          lineHeight: baseLineHeight * preferences.fontScale * preferences.lineSpacing,
          letterSpacing: preferences.letterSpacing,
        },
        style,
      ]}
    >
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '800',
  },
});
