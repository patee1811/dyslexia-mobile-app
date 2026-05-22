import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../PrimaryButton';
import { colors } from '../../theme/colors';
import type { PracticeStepProps } from './types';

export default function PersonalizedReviewStep({
  task,
  taskIndex,
  totalTasks,
  onAnswer,
  onNext,
  onReplayAudio,
}: PracticeStepProps) {
  const [reviewedItems, setReviewedItems] = useState<string[]>([]);
  const startedAtRef = useRef(Date.now());
  const reviewWords = task.reviewWords ?? [];

  useEffect(() => {
    setReviewedItems([]);
    startedAtRef.current = Date.now();
  }, [task.id]);

  const reviewItem = (item: string) => {
    setReviewedItems((previous) => (previous.includes(item) ? previous : [...previous, item]));
    onAnswer({
      taskId: task.id,
      selectedAnswer: item,
      isCorrect: true,
      supportUsed: ['personalized_review', 'audio_replay'],
      responseTimeMs: Date.now() - startedAtRef.current,
    });
    onReplayAudio?.(item);
  };

  const finish = () => {
    onAnswer({
      taskId: task.id,
      selectedAnswer: reviewedItems.join(', '),
      isCorrect: true,
      supportUsed: ['personalized_review'],
      responseTimeMs: Date.now() - startedAtRef.current,
    });
    onNext();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.progressText}>{`Bước ${taskIndex + 1} / ${totalTasks}`}</Text>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.instruction}>{task.instruction}</Text>
      <Text style={styles.promptText}>{task.prompt}</Text>

      <View style={styles.reviewGrid}>
        {reviewWords.map((item) => {
          const reviewed = reviewedItems.includes(item);

          return (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityLabel={`Ôn ${item}`}
              onPress={() => reviewItem(item)}
              style={({ pressed }) => [
                styles.reviewChip,
                reviewed && styles.reviewedChip,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.reviewText}>{item}</Text>
              <Text style={styles.reviewHint}>{reviewed ? 'Đã nghe' : 'Chạm để nghe'}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.tipBox}>
        <Text style={styles.tipTitle}>Gợi ý</Text>
        <Text style={styles.tipText}>Chỉ ôn 3-5 mục hay gặp nhất. Nếu con mệt, dừng sau một lượt nghe và đọc lại.</Text>
      </View>

      <PrimaryButton label="Đã ôn xong" onPress={finish} disabled={reviewedItems.length === 0} />
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
  promptText: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
  },
  reviewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  reviewChip: {
    minWidth: 110,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 3,
  },
  reviewedChip: {
    borderColor: colors.teal,
    backgroundColor: colors.tealSoft,
  },
  pressed: {
    opacity: 0.86,
  },
  reviewText: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  reviewHint: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  tipBox: {
    borderRadius: 18,
    backgroundColor: '#FFF1E7',
    padding: 14,
    gap: 4,
  },
  tipTitle: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  tipText: {
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
});
