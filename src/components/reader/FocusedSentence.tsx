import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import type { WarmupWord } from '../../types';
import type { ReaderPreferences } from '../practice/types';
import ReadableText from './ReadableText';

type Props = {
  sentence: string;
  preferences: ReaderPreferences;
  warmupWords?: WarmupWord[];
  flaggedWords?: string[];
  onWordPress?: (word: string) => void;
};

function cleanWord(raw: string) {
  return raw.toLowerCase().replace(/[.,!?;:]/g, '').trim();
}

export default function FocusedSentence({
  sentence,
  preferences,
  warmupWords = [],
  flaggedWords = [],
  onWordPress,
}: Props) {
  const [focusedWordIndex, setFocusedWordIndex] = useState<number | null>(null);
  const words = sentence.split(/\s+/).filter(Boolean);

  return (
    <View style={styles.container}>
      {preferences.superFocus ? <View style={styles.maskBar} /> : null}
      <View style={[styles.sentenceCanvas, preferences.focusMode && styles.focusCanvas]}>
        {preferences.focusMode ? <View style={styles.focusLine} /> : null}
        <ReadableText text={sentence} preferences={preferences} size="sentence" style={styles.sentenceText} />
      </View>
      {preferences.superFocus ? <View style={styles.maskBar} /> : null}

      <View style={styles.wordWrap}>
        {words.map((rawWord, index) => {
          const normalizedWord = cleanWord(rawWord);
          const flagged = flaggedWords.includes(normalizedWord);
          const warmupWord = warmupWords.find((item) => item.word === normalizedWord);
          const focused = focusedWordIndex === index;

          return (
            <Pressable
              key={`${rawWord}-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`Nghe từ ${normalizedWord}`}
              accessibilityState={{ selected: focused }}
              onPress={() => {
                setFocusedWordIndex(index);
                onWordPress?.(normalizedWord);
              }}
              style={({ pressed }) => [
                styles.wordChip,
                flagged && styles.flaggedWordChip,
                focused && styles.focusedWordChip,
                pressed && styles.pressed,
              ]}
            >
              <ReadableText text={rawWord} preferences={preferences} size="word" style={[styles.wordText, focused && styles.focusedWordText]} />
              {preferences.showSyllables && warmupWord ? <Text style={styles.syllableText}>{warmupWord.syllables}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  maskBar: {
    height: 18,
    borderRadius: 999,
    backgroundColor: '#EADBC5',
    opacity: 0.8,
  },
  sentenceCanvas: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#FFFDF8',
    paddingHorizontal: 18,
    paddingVertical: 20,
    overflow: 'hidden',
  },
  focusCanvas: {
    backgroundColor: '#FFF9EE',
  },
  focusLine: {
    position: 'absolute',
    left: 0,
    top: '42%',
    width: '100%',
    height: 44,
    backgroundColor: '#F8E4C8',
    opacity: 0.55,
  },
  sentenceText: {
    color: colors.ink,
  },
  wordWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 2,
  },
  flaggedWordChip: {
    borderColor: '#E3B596',
    backgroundColor: colors.accentSoft,
  },
  focusedWordChip: {
    borderColor: colors.teal,
    backgroundColor: colors.tealSoft,
    transform: [{ scale: 1.02 }],
  },
  pressed: {
    opacity: 0.85,
  },
  wordText: {
    color: colors.ink,
  },
  focusedWordText: {
    color: colors.teal,
  },
  syllableText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '900',
  },
});
