import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../PrimaryButton';
import { colors } from '../../theme/colors';
import type { PracticeStepProps } from './types';

export default function SoundToLetterStep({
  task,
  taskIndex,
  totalTasks,
  onAnswer,
  onNext,
  onReplayAudio,
}: PracticeStepProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>();
  const startedAtRef = useRef(Date.now());
  const choices = task.choices ?? [];
  const isCorrect = selectedAnswer !== undefined && selectedAnswer === task.correctAnswer;

  useEffect(() => {
    setSelectedAnswer(undefined);
    startedAtRef.current = Date.now();
  }, [task.id]);

  const chooseAnswer = (answer: string) => {
    const answerIsCorrect = answer === task.correctAnswer;
    setSelectedAnswer(answer);
    onAnswer({
      taskId: task.id,
      selectedAnswer: answer,
      isCorrect: answerIsCorrect,
      responseTimeMs: Date.now() - startedAtRef.current,
    });
  };
  const replay = () => {
    onAnswer({
      taskId: task.id,
      isCorrect: true,
      supportUsed: ['audio_replay'],
      responseTimeMs: Date.now() - startedAtRef.current,
    });
    onReplayAudio?.(task.audioText ?? task.targetText ?? '');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progressText}>{`Bước ${taskIndex + 1} / ${totalTasks}`}</Text>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.instruction}>{task.instruction}</Text>

      <View style={styles.soundCard}>
        <Text style={styles.soundLabel}>Âm cần nghe</Text>
        <Text style={styles.soundText}>{task.targetText}</Text>
        <PrimaryButton label="Nghe âm" onPress={replay} secondary compact />
      </View>

      <View style={styles.choiceGrid}>
        {choices.map((choice) => {
          const active = selectedAnswer === choice;
          const wrong = active && !isCorrect;

          return (
            <Pressable
              key={choice}
              accessibilityRole="button"
              onPress={() => chooseAnswer(choice)}
              style={({ pressed }) => [
                styles.choiceButton,
                active && styles.selectedChoice,
                active && isCorrect && styles.correctChoice,
                wrong && styles.wrongChoice,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.choiceText}>{choice}</Text>
            </Pressable>
          );
        })}
      </View>

      {selectedAnswer ? (
        <Text style={[styles.feedback, isCorrect ? styles.correctFeedback : styles.gentleFeedback]}>
          {isCorrect ? 'Đúng âm đầu rồi.' : 'Chưa đúng. Mình nghe lại âm rồi chọn tiếp nhé.'}
        </Text>
      ) : null}

      <PrimaryButton label="Tiếp tục" onPress={onNext} disabled={!selectedAnswer} />
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
  soundCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#FFFDF8',
    padding: 16,
    gap: 8,
    alignItems: 'center',
  },
  soundLabel: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  soundText: {
    color: colors.ink,
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 48,
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choiceButton: {
    minHeight: 72,
    minWidth: '30%',
    flexGrow: 1,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  selectedChoice: {
    borderColor: colors.accent,
    backgroundColor: '#FFF3E8',
  },
  correctChoice: {
    borderColor: colors.teal,
    backgroundColor: colors.tealSoft,
  },
  wrongChoice: {
    borderColor: '#E0B29E',
    backgroundColor: '#FFF3E8',
  },
  pressed: {
    opacity: 0.88,
  },
  choiceText: {
    color: colors.ink,
    fontSize: 28,
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
