import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import SectionCard from '../SectionCard';
import { colors } from '../../theme/colors';

type SkillStatus = 'not-started' | 'in-practice' | 'needs-review' | 'stable';

type Skill = {
  name: string;
  status: SkillStatus;
  masteryPercent?: number;
};

type Props = {
  skills: Skill[];
};

const statusConfig: Record<SkillStatus, { label: string; color: string }> = {
  'not-started': { label: 'Chưa mở', color: '#D0D0D0' },
  'in-practice': { label: 'Đang tiến bộ', color: '#FFD36A' },
  'needs-review': { label: 'Cần ôn thêm', color: '#FFB05C' },
  stable: { label: 'Đã ổn định', color: '#6DBB75' },
};

export default function SkillMasteryCard({ skills }: Props) {
  return (
    <SectionCard title="Kỹ năng cần luyện" subtitle="Dùng ngôn ngữ hỗ trợ, không gắn nhãn yếu/kém cho trẻ">
      <ScrollView style={styles.skillsList} scrollEnabled={skills.length > 4}>
        {skills.map((skill) => {
          const config = statusConfig[skill.status];

          return (
            <View key={skill.name} style={styles.skillItem}>
              <View style={styles.skillHeader}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
                  <Text style={styles.statusLabel}>{config.label}</Text>
                </View>
              </View>
              {skill.masteryPercent !== undefined ? (
                <View style={styles.masteryBar}>
                  <View
                    style={[
                      styles.masteryFill,
                      {
                        width: `${Math.max(0, Math.min(skill.masteryPercent, 100))}%`,
                        backgroundColor: config.color,
                      },
                    ]}
                  />
                </View>
              ) : null}
            </View>
          );
        })}
      </ScrollView>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  skillsList: {
    maxHeight: 250,
  },
  skillItem: {
    marginVertical: 10,
    gap: 8,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ink,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  masteryBar: {
    height: 8,
    backgroundColor: colors.line,
    borderRadius: 4,
    overflow: 'hidden',
  },
  masteryFill: {
    height: '100%',
    borderRadius: 4,
  },
});
