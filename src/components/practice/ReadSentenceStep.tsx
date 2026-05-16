import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../PrimaryButton';
import FocusedSentence from '../reader/FocusedSentence';
import { colors } from '../../theme/colors';
import type { PracticeStepProps } from './types';

export default function ReadSentenceStep({
  task,
  taskIndex,
  totalTasks,
  onAnswer,
  onNext,
  onReplayAudio,
}: PracticeStepProps) {
  const [flagged, setFlagged] = useState(false);
  const startedAtRef = useRef(Date.now());
  const sentence = task.sentence ?? task.targetText ?? '';

  useEffect(() => {
    setFlagged(false);
    startedAtRef.current = Date.now();
  }, [task.id]);

  const flagSentence = () => {
    if (!flagged) {
      onAnswer({
        taskId: task.id,
        selectedAnswer: sentence,
        supportUsed: ['flagged_sentence'],
        responseTimeMs: Date.now() - startedAtRef.current,
      });
      setFlagged(true);
    }
  };

  const finishSentence = () => {
    onAnswer({
      taskId: task.id,
      selectedAnswer: 'sentence_read_done',
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

      <Text style={styles.sentenceCounter}>
        {task.sentenceIndex !== undefined && task.totalSentences
          ? `Câu ${task.sentenceIndex + 1} / ${task.totalSentences}`
          : 'Câu luyện đọc'}
      </Text>

      {task.readerPreferences ? (
        <FocusedSentence
          sentence={sentence}
          preferences={task.readerPreferences}
          warmupWords={task.warmupWords}
          flaggedWords={task.flaggedWords}
          onWordPress={(word) => onReplayAudio?.(word)}
        />
      ) : (
        <Text style={styles.fallbackSentence}>{sentence}</Text>
      )}

      {flagged ? <Text style={styles.feedback}>Mình đã ghi chú câu này cần ôn chậm hơn.</Text> : null}

      <View style={styles.actions}>
        <PrimaryButton label="Nghe câu" onPress={() => onReplayAudio?.(sentence)} secondary />
        <PrimaryButton label="Câu này khó" onPress={flagSentence} secondary />
        <PrimaryButton label="Đã đọc xong" onPress={finishSentence} />
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
  sentenceCounter: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '900',
  },
  fallbackSentence: {
    color: colors.ink,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 38,
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
