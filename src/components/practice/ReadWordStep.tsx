import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../PrimaryButton';
import { colors } from '../../theme/colors';
import type { PracticeStepProps } from './types';

export default function ReadWordStep({
  task,
  taskIndex,
  totalTasks,
  onAnswer,
  onNext,
  onReplayAudio,
}: PracticeStepProps) {
  const [flagged, setFlagged] = useState(false);
  const startedAtRef = useRef(Date.now());
  const word = task.targetText ?? '';

  useEffect(() => {
    setFlagged(false);
    startedAtRef.current = Date.now();
  }, [task.id]);

  const flagWord = () => {
    if (!flagged) {
      onAnswer({
        taskId: task.id,
        selectedAnswer: word,
        supportUsed: ['flagged_word'],
        responseTimeMs: Date.now() - startedAtRef.current,
      });
      setFlagged(true);
    }
  };

  const finishWord = () => {
    onAnswer({
      taskId: task.id,
      selectedAnswer: 'read_done',
      isCorrect: true,
      responseTimeMs: Date.now() - startedAtRef.current,
    });
    onNext();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progressText}>{`Bước ${taskIndex + 1} / ${totalTasks}`}</Text>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.instruction}>{task.instruction}</Text>

      <View style={styles.wordCard}>
        <Text style={styles.wordLabel}>Từ cần đọc</Text>
        <Text style={styles.wordText}>{word}</Text>
      </View>

      {flagged ? <Text style={styles.feedback}>Mình đã đưa từ này vào phần ôn.</Text> : null}

      <View style={styles.actions}>
        <PrimaryButton label="Nghe mẫu" onPress={() => onReplayAudio?.(word)} secondary />
        <PrimaryButton label="Từ này khó" onPress={flagWord} secondary />
        <PrimaryButton label="Con đã đọc xong" onPress={finishWord} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  progressText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '800',
  },
  title: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
  },
  instruction: {
    color: colors.mutedText,
    fontSize: 16,
    lineHeight: 24,
  },
  wordCard: {
    minHeight: 150,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#FFFDF8',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
  },
  wordLabel: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  wordText: {
    color: colors.ink,
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 58,
    textAlign: 'center',
  },
  feedback: {
    color: colors.accent,
    backgroundColor: '#FFF1E7',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
  },
  actions: {
    gap: 10,
  },
});
