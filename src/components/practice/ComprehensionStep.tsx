import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../PrimaryButton';
import { colors } from '../../theme/colors';
import type { PracticeStepProps } from './types';

export default function ComprehensionStep({
  task,
  taskIndex,
  totalTasks,
  onAnswer,
  onNext,
}: PracticeStepProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>();
  const startedAtRef = useRef(Date.now());
  const options = (task.options ?? []).slice(0, 3);
  const isCorrect = selectedIndex !== undefined && selectedIndex === task.answerIndex;

  useEffect(() => {
    setSelectedIndex(undefined);
    startedAtRef.current = Date.now();
  }, [task.id]);

  const chooseAnswer = (answer: string, index: number) => {
    const answerIsCorrect = index === task.answerIndex;
    setSelectedIndex(index);
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

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{task.prompt}</Text>
      </View>

      <View style={styles.optionList}>
        {options.map((option, index) => {
          const active = selectedIndex === index;
          const wrong = active && !isCorrect;

          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              onPress={() => chooseAnswer(option, index)}
              style={({ pressed }) => [
                styles.optionButton,
                active && styles.selectedOption,
                active && isCorrect && styles.correctOption,
                wrong && styles.wrongOption,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          );
        })}
      </View>

      {selectedIndex !== undefined ? (
        <Text style={[styles.feedback, isCorrect ? styles.correctFeedback : styles.gentleFeedback]}>
          {isCorrect ? task.explanation ?? 'Đúng rồi.' : 'Chưa đúng. Con đọc lại câu hỏi thật chậm nhé.'}
        </Text>
      ) : null}

      <PrimaryButton label="Tiếp tục" onPress={onNext} disabled={selectedIndex === undefined} />
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
  questionCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#FFFDF8',
    padding: 16,
  },
  questionText: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '900',
    lineHeight: 29,
  },
  optionList: {
    gap: 10,
  },
  optionButton: {
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.white,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectedOption: {
    borderColor: colors.accent,
    backgroundColor: '#FFF3E8',
  },
  correctOption: {
    borderColor: colors.teal,
    backgroundColor: colors.tealSoft,
  },
  wrongOption: {
    borderColor: '#E0B29E',
    backgroundColor: '#FFF3E8',
  },
  pressed: {
    opacity: 0.88,
  },
  optionText: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
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
