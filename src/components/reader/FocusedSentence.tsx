import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  spokenText?: string | null;
  isSpeaking?: boolean;
  onWordPress?: (word: string) => void;
};

function cleanWord(raw: string) {
  return raw.toLowerCase().replace(/[.,!?;:]/g, '').trim();
}

function normalizeSpeechText(raw: string) {
  return raw
    .normalize('NFC')
    .toLowerCase()
    .replace(/[.,!?;:"'()[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function estimateWordDuration(rawWord: string) {
  const word = cleanWord(rawWord);
  const punctuationPause = /[.!?]$/.test(rawWord) ? 240 : /[,;:]$/.test(rawWord) ? 130 : 70;

  return 300 + Math.min(word.length, 8) * 38 + punctuationPause;
}

export default function FocusedSentence({
  sentence,
  preferences,
  warmupWords = [],
  flaggedWords = [],
  spokenText,
  isSpeaking = false,
  onWordPress,
}: Props) {
  const [focusedWordIndex, setFocusedWordIndex] = useState<number | null>(null);
  const autoFocusSentenceRef = useRef<string | null>(null);
  const words = useMemo(() => sentence.split(/\s+/).filter(Boolean), [sentence]);
  const sentenceSpeechKey = normalizeSpeechText(sentence);
  const spokenSpeechKey = normalizeSpeechText(spokenText ?? '');

  useEffect(() => {
    const isSentencePlayback = isSpeaking && Boolean(spokenText) && spokenSpeechKey === sentenceSpeechKey;

    if (!isSentencePlayback || words.length === 0) {
      if (isSpeaking && spokenText) {
        autoFocusSentenceRef.current = null;
      }

      return undefined;
    }

    autoFocusSentenceRef.current = sentenceSpeechKey;
    const durations = words.map(estimateWordDuration);
    const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
    const startedAt = Date.now();

    const updateFocusedWord = () => {
      const elapsed = Math.min(Date.now() - startedAt, totalDuration - 1);
      let cursor = 0;

      for (let index = 0; index < durations.length; index += 1) {
        cursor += durations[index];

        if (elapsed < cursor) {
          setFocusedWordIndex(index);
          return;
        }
      }

      setFocusedWordIndex(durations.length - 1);
    };

    updateFocusedWord();
    const interval = setInterval(updateFocusedWord, 120);

    return () => clearInterval(interval);
  }, [isSpeaking, sentenceSpeechKey, spokenSpeechKey, spokenText, words]);

  useEffect(() => {
    if (isSpeaking || autoFocusSentenceRef.current !== sentenceSpeechKey || words.length === 0) {
      return undefined;
    }

    setFocusedWordIndex(words.length - 1);
    const timeout = setTimeout(() => {
      if (autoFocusSentenceRef.current === sentenceSpeechKey) {
        autoFocusSentenceRef.current = null;
      }
    }, 650);

    return () => clearTimeout(timeout);
  }, [isSpeaking, sentenceSpeechKey, words.length]);

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
    backgroundColor: '#FFFBF2',
    borderColor: '#E8C06F',
  },
  focusLine: {
    position: 'absolute',
    left: 0,
    top: '50%',
    width: '100%',
    height: 58,
    marginTop: -29,
    backgroundColor: '#FFE2A8',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0C66B',
    opacity: 0.95,
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
