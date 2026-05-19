import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import PrimaryButton from '../PrimaryButton';
import { colors } from '../../theme/colors';
import type { PracticeStepProps } from './types';

function normalizeAnswer(value: string) {
  return value.normalize('NFC').trim().toLowerCase();
}

export default function DictationSpellingStep({
  task,
  taskIndex,
  totalTasks,
  onAnswer,
  onNext,
  onReplayAudio,
}: PracticeStepProps) {
  const [draft, setDraft] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const startedAtRef = useRef(Date.now());
  const choices = task.choices ?? [];
  const correctAnswer = task.correctAnswer ?? '';
  const isCorrect = submitted && normalizeAnswer(draft) === normalizeAnswer(correctAnswer);

  useEffect(() => {
    setDraft('');
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
    onReplayAudio?.(task.audioText ?? task.targetText ?? '');
  };

  const submitAnswer = (answer = draft) => {
    const answerIsCorrect = normalizeAnswer(answer) === normalizeAnswer(correctAnswer);
    setDraft(answer);
    setSubmitted(true);
    onAnswer({
      taskId: task.id,
      selectedAnswer: answer,
      isCorrect: answerIsCorrect,
      responseTimeMs: Date.now() - startedAtRef.current,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progressText}>{`Bước ${taskIndex + 1} / ${totalTasks}`}</Text>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.instruction}>{task.instruction}</Text>

      <View style={styles.promptCard}>
        <Text style={styles.promptLabel}>Nghe viết</Text>
        <Text style={styles.promptText}>{task.prompt ?? 'Nghe mẫu rồi nhập tiếng đúng.'}</Text>
        <PrimaryButton label="Nghe tiếng" onPress={replay} secondary />
      </View>

      <TextInput
        value={draft}
        onChangeText={(value) => {
          setDraft(value);
          setSubmitted(false);
        }}
        placeholder="Gõ tiếng con nghe được"
        placeholderTextColor={colors.mutedText}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />

      {choices.length ? (
        <View style={styles.choiceList}>
          {choices.map((choice) => {
            const active = normalizeAnswer(choice) === normalizeAnswer(draft);

            return (
              <Pressable
                key={choice}
                accessibilityRole="button"
                accessibilityLabel={`Chọn ${choice}`}
                onPress={() => submitAnswer(choice)}
                style={({ pressed }) => [
                  styles.choiceButton,
                  active && styles.selectedChoice,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.choiceText}>{choice}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {submitted ? (
        <Text style={[styles.feedback, isCorrect ? styles.correctFeedback : styles.gentleFeedback]}>
          {isCorrect ? 'Đúng rồi. Con đã nghe và viết đúng.' : 'Chưa đúng. Con nghe lại rồi thử viết chậm hơn nhé.'}
        </Text>
      ) : null}

      <PrimaryButton label="Kiểm tra" onPress={() => submitAnswer()} disabled={!draft.trim()} secondary />
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
  promptCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#FFFDF8',
    padding: 16,
    gap: 10,
  },
  promptLabel: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  promptText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 26,
  },
  input: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.white,
    color: colors.ink,
    paddingHorizontal: 16,
    fontSize: 22,
    fontWeight: '900',
  },
  choiceList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choiceButton: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  selectedChoice: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  pressed: {
    opacity: 0.86,
  },
  choiceText: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
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
