import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../PrimaryButton';
import { colors } from '../../theme/colors';
import type { ChoiceDetail, PracticeStepProps } from './types';

export default function ToneMinimalPairStep({
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

  const getChoiceDetail = (choice: string): ChoiceDetail | undefined => task.choiceDetails?.find((item) => item.value === choice);

  return (
    <View style={styles.container}>
      <Text style={styles.progressText}>{`Bước ${taskIndex + 1} / ${totalTasks}`}</Text>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.instruction}>{task.instruction}</Text>

      <View style={styles.listenCard}>
        <Text style={styles.listenLabel}>Nghe</Text>
        <Text style={styles.listenText}>{task.targetText}</Text>
        <PrimaryButton label="Nghe lại" onPress={replay} secondary compact />
      </View>

      <View style={styles.choiceList}>
        {choices.map((choice) => {
          const active = selectedAnswer === choice;
          const wrong = active && !isCorrect;
          const detail = getChoiceDetail(choice);

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
              <View style={styles.choiceTextRow}>
                <Text style={styles.choiceText}>{choice}</Text>
                <View style={styles.toneMarker}>
                  <Text style={styles.toneMarkerText}>{detail?.label ?? 'không dấu'}</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {selectedAnswer ? (
        <Text style={[styles.feedback, isCorrect ? styles.correctFeedback : styles.gentleFeedback]}>
          {isCorrect ? 'Đúng dấu thanh rồi.' : 'Chưa đúng. Con nhìn nhãn dấu thanh và nghe lại nhé.'}
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
  listenCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#FFFDF8',
    padding: 16,
    gap: 8,
    alignItems: 'center',
  },
  listenLabel: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  listenText: {
    color: colors.ink,
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 52,
  },
  choiceList: {
    gap: 10,
  },
  choiceButton: {
    minHeight: 70,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.white,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  choiceTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  choiceText: {
    color: colors.ink,
    flex: 1,
    fontSize: 28,
    fontWeight: '900',
  },
  toneMarker: {
    borderRadius: 999,
    backgroundColor: colors.sky,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  toneMarkerText: {
    color: colors.ink,
    fontSize: 13,
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
