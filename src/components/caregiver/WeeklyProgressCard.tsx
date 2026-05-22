import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SectionCard from '../SectionCard';
import { colors } from '../../theme/colors';

type DayProgress = {
  day: string;
  minutes: number;
  lessonsCompleted: number;
  accuracy?: number;
};

type Props = {
  weekData: DayProgress[];
  weekGoal: number;
};

export default function WeeklyProgressCard({ weekData, weekGoal }: Props) {
  const totalMinutes = weekData.reduce((sum, day) => sum + day.minutes, 0);
  const totalLessons = weekData.reduce((sum, day) => sum + day.lessonsCompleted, 0);
  const progressPercent = Math.min((totalMinutes / weekGoal) * 100, 100);
  const daysWithAccuracy = weekData.filter((day) => day.accuracy !== undefined);
  const avgAccuracy =
    daysWithAccuracy.reduce((sum, day) => sum + (day.accuracy ?? 0), 0) / (daysWithAccuracy.length || 1);

  return (
    <SectionCard title="Tiến bộ tuần này" subtitle={`Mục tiêu: ${weekGoal} phút/tuần`}>
      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressValue}>
            {Math.round(totalMinutes)} / {weekGoal} phút
          </Text>
          <Text style={styles.progressPercent}>{Math.round(progressPercent)}%</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{totalLessons}</Text>
          <Text style={styles.statLabel}>bài hoàn thành</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{Math.round(avgAccuracy)}%</Text>
          <Text style={styles.statLabel}>chính xác trung bình</Text>
        </View>
      </View>

      <View style={styles.dayBreakdown}>
        <Text style={styles.breakdownTitle}>Chi tiết từng ngày</Text>
        <View style={styles.dayGrid}>
          {weekData.map((day) => (
            <View key={day.day} style={styles.dayCell}>
              <Text style={styles.dayLabel}>{day.day}</Text>
              {day.minutes > 0 ? (
                <>
                  <Text style={styles.dayMinutes}>{day.minutes}m</Text>
                  <Text style={styles.dayLessons}>{day.lessonsCompleted} bài</Text>
                </>
              ) : (
                <Text style={styles.dayEmpty}>-</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  progressSection: {
    gap: 12,
  },
  progressBar: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.ink,
  },
  progressPercent: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4CAF50',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  statLabel: {
    fontSize: 11,
    color: colors.mutedText,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: colors.line,
  },
  dayBreakdown: {
    gap: 10,
  },
  breakdownTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.mutedText,
  },
  dayGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  dayCell: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.mutedText,
  },
  dayMinutes: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  dayLessons: {
    fontSize: 10,
    color: colors.mutedText,
  },
  dayEmpty: {
    fontSize: 12,
    color: colors.line,
    fontWeight: '600',
  },
});
