import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import SectionCard from '../SectionCard';
import { colors } from '../../theme/colors';

type Props = {
  title: string;
  reason: string;
  difficulty?: 'foundation' | 'building' | 'stretch';
  focusSkill?: string;
  estimatedMinutes?: number;
  onPress?: () => void;
};

const difficultyConfig = {
  foundation: { label: 'Nền tảng', color: '#4F8A5B' },
  building: { label: 'Đang luyện', color: '#2F6FB8' },
  stretch: { label: 'Tăng nhẹ', color: '#B86F2F' },
};

export default function NextLessonCard({
  title,
  reason,
  difficulty = 'building',
  focusSkill,
  estimatedMinutes = 8,
  onPress,
}: Props) {
  const config = difficultyConfig[difficulty];

  return (
    <SectionCard title="Bài nên học tiếp" subtitle="Dựa trên tiến bộ và từ cần ôn gần đây">
      <Pressable style={({ pressed }) => [styles.lessonBox, pressed && styles.lessonBoxPressed]} onPress={onPress}>
        <View style={styles.lessonHeader}>
          <Text style={styles.lessonTitle}>{title}</Text>
          <View style={[styles.difficultyTag, { backgroundColor: config.color }]}>
            <Text style={styles.difficultyText}>{config.label}</Text>
          </View>
        </View>

        <View style={styles.reasonBox}>
          <Text style={styles.reasonLabel}>Lý do</Text>
          <Text style={styles.reasonText}>{reason}</Text>
        </View>

        <View style={styles.metaRow}>
          {focusSkill ? (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Kỹ năng</Text>
              <Text style={styles.metaValue}>{focusSkill}</Text>
            </View>
          ) : null}
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Thời lượng</Text>
            <Text style={styles.metaValue}>~{estimatedMinutes} phút</Text>
          </View>
        </View>

        <Text style={styles.ctaText}>Nhấn để bắt đầu bài</Text>
      </Pressable>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  lessonBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  lessonBoxPressed: {
    backgroundColor: '#EBEBEB',
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  lessonTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
    flex: 1,
  },
  difficultyTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  reasonBox: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.mutedText,
    textTransform: 'uppercase',
  },
  reasonText: {
    fontSize: 14,
    color: colors.ink,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flex: 1,
    gap: 2,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.mutedText,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.ink,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.accent,
    textAlign: 'center',
    marginTop: 4,
  },
});
