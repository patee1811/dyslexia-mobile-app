import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../PrimaryButton';
import { colors } from '../../theme/colors';
import type { PracticeStepProps } from './types';

export default function BlendSyllableStep({
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
  const parts = task.parts;
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

  return (
    <View style={styles.container}>
      <Text style={styles.progressText}>{`Bước ${taskIndex + 1} / ${totalTasks}`}</Text>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.instruction}>{task.instruction}</Text>

      <View style={styles.partsCard}>
        <PartRow label="Âm đầu" value={parts?.initial || 'không có'} onPress={() => parts?.initial && onReplayAudio?.(parts.initial)} />
        <PartRow label="Vần" value={parts?.rime ?? ''} onPress={() => parts?.rime && onReplayAudio?.(parts.rime)} />
        <PartRow label="Thanh" value={parts?.tone ?? 'không dấu'} />
        <PartRow label="Kết quả" value={isCorrect ? parts?.result ?? task.targetText ?? '' : '...'} strong />
      </View>

      <PrimaryButton label="Nghe tiếng mẫu" onPress={() => onReplayAudio?.(task.audioText ?? task.targetText ?? '')} secondary />

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
          {isCorrect ? 'Đúng rồi, các phần đã ghép thành tiếng.' : 'Gần đúng rồi. Con chạm nghe lại từng phần nhé.'}
        </Text>
      ) : null}

      <PrimaryButton label="Tiếp tục" onPress={onNext} disabled={!selectedAnswer} />
    </View>
  );
}

type PartRowProps = {
  label: string;
  value: string;
  strong?: boolean;
  onPress?: () => void;
};

function PartRow({ label, value, strong = false, onPress }: PartRowProps) {
  const content = (
    <>
      <Text style={styles.partLabel}>{label}</Text>
      <Text style={[styles.partValue, strong && styles.partValueStrong]}>{value}</Text>
    </>
  );

  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.partRow, pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.partRow}>{content}</View>;
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
  partsCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#FFFDF8',
    overflow: 'hidden',
  },
  partRow: {
    minHeight: 58,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  partLabel: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: '800',
  },
  partValue: {
    color: colors.ink,
    flexShrink: 1,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'right',
  },
  partValueStrong: {
    color: colors.accent,
    fontSize: 26,
  },
  choiceList: {
    gap: 10,
  },
  choiceButton: {
    minHeight: 60,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.white,
    justifyContent: 'center',
    paddingHorizontal: 18,
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
