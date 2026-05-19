import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import PrimaryButton from '../PrimaryButton';
import { colors } from '../../theme/colors';
import type { PracticeStepProps } from './types';

function wordCount(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export default function StoryRetellStep({
  task,
  taskIndex,
  totalTasks,
  onAnswer,
  onNext,
  onReplayAudio,
}: PracticeStepProps) {
  const [retellText, setRetellText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const startedAtRef = useRef(Date.now());
  const minWords = task.minWords ?? 4;
  const enoughWords = wordCount(retellText) >= minWords;

  useEffect(() => {
    setRetellText('');
    setSubmitted(false);
    startedAtRef.current = Date.now();
  }, [task.id]);

  const replay = () => {
    onAnswer({
      taskId: task.id,
      isCorrect: true,
      supportUsed: ['audio_replay'],
      responseTimeMs: Date.now() - startedAtRef.current,
    });
    onReplayAudio?.(task.audioText ?? task.story ?? '');
  };

  const submit = () => {
    setSubmitted(true);
    onAnswer({
      taskId: task.id,
      selectedAnswer: retellText.trim(),
      isCorrect: enoughWords,
      supportUsed: ['story_retell'],
      responseTimeMs: Date.now() - startedAtRef.current,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progressText}>{`Bước ${taskIndex + 1} / ${totalTasks}`}</Text>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.instruction}>{task.instruction}</Text>

      <View style={styles.storyCard}>
        <Text style={styles.storyLabel}>Câu chuyện</Text>
        <Text style={styles.storyText}>{task.story}</Text>
        <PrimaryButton label="Nghe lại câu chuyện" onPress={replay} secondary />
      </View>

      <Text style={styles.promptText}>{task.prompt}</Text>
      <TextInput
        value={retellText}
        onChangeText={(value) => {
          setRetellText(value);
          setSubmitted(false);
        }}
        placeholder="Ví dụ: Lan nhặt lá và tặng bà."
        placeholderTextColor={colors.mutedText}
        multiline
        style={styles.input}
      />

      {submitted ? (
        <Text style={[styles.feedback, enoughWords ? styles.correctFeedback : styles.gentleFeedback]}>
          {enoughWords
            ? 'Tốt rồi. Con đã kể lại được ý chính bằng lời của mình.'
            : 'Con có thể kể thêm một vài từ nữa, không cần giống hệt câu chuyện.'}
        </Text>
      ) : null}

      <PrimaryButton label="Con đã kể lại" onPress={submit} disabled={!retellText.trim()} secondary />
      <PrimaryButton label="Tiếp tục" onPress={onNext} disabled={!submitted} />
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
  storyCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#FFFDF8',
    padding: 16,
    gap: 10,
  },
  storyLabel: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  storyText: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 30,
  },
  promptText: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
  },
  input: {
    minHeight: 96,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.white,
    color: colors.ink,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '700',
  },
  feedback: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
  },
  correctFeedback: {
    color: colors.teal,
    backgroundColor: '#E8F5EF',
  },
  gentleFeedback: {
    color: colors.accent,
    backgroundColor: '#FFF1E7',
  },
});
