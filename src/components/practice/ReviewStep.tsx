import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../PrimaryButton';
import { colors } from '../../theme/colors';
import type { PracticeStepProps } from './types';

export default function ReviewStep({ task, taskIndex, totalTasks, onNext }: PracticeStepProps) {
  const reviewWords = task.reviewWords ?? [];

  return (
    <View style={styles.container}>
      <Text style={styles.progressText}>{`Bước ${taskIndex + 1} / ${totalTasks}`}</Text>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.instruction}>{task.instruction}</Text>

      <View style={styles.completeCard}>
        <Text style={styles.completeTitle}>Con đã hoàn thành bài hôm nay.</Text>
        <Text style={styles.completeText}>Mình dừng ở đây để giữ buổi học ngắn và nhẹ.</Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Từ / dấu cần ôn</Text>
        <View style={styles.chips}>
          {reviewWords.length > 0 ? (
            reviewWords.map((word) => (
              <View key={word} style={styles.chip}>
                <Text style={styles.chipText}>{word}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>Chưa có từ khó nào được đánh dấu.</Text>
          )}
        </View>
      </View>

      <View style={styles.block}>
        <Text style={styles.blockTitle}>Bước tiếp theo</Text>
        <Text style={styles.nextText}>{task.nextSuggestion}</Text>
      </View>

      <PrimaryButton label={task.completed ? 'Làm lại bài này' : 'Lưu buổi học'} onPress={onNext} />
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
  completeCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: '#FFFDF8',
    padding: 18,
    gap: 6,
  },
  completeTitle: {
    color: colors.ink,
    fontSize: 23,
    fontWeight: '900',
    lineHeight: 30,
  },
  completeText: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 23,
  },
  block: {
    gap: 8,
  },
  blockTitle: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 23,
  },
  nextText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 24,
  },
});
