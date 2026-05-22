import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../PrimaryButton';
import { colors } from '../../theme/colors';
import type { PracticeStepProps } from './types';

export default function ListenChooseStep({
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

      <PrimaryButton label="Nghe lại" onPress={replay} secondary />

      <View style={styles.choiceList}>
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
          {isCorrect ? 'Đúng rồi. Con nghe và chọn rất rõ.' : 'Chưa đúng. Con nghe lại rồi thử lần nữa nhé.'}
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
  choiceList: {
    gap: 10,
  },
  choiceButton: {
    minHeight: 64,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.white,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
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
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
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
