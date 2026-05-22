import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import SectionCard from '../SectionCard';
import { colors } from '../../theme/colors';

type Props = {
  name: string;
  age: number;
  readingLevel: string;
  region?: 'north' | 'central' | 'south';
  supportNeeds?: string[];
  strengths?: string[];
  interests?: string[];
  weeklyGoal?: number;
};

const regionLabel = {
  north: 'Miền Bắc',
  central: 'Miền Trung',
  south: 'Miền Nam',
};

export default function ProfileCard({
  name,
  age,
  readingLevel,
  region,
  supportNeeds = [],
  strengths = [],
  interests = [],
  weeklyGoal = 5,
}: Props) {
  return (
    <SectionCard title="Hồ sơ trẻ" subtitle="Thông tin cơ bản và nhu cầu hỗ trợ">
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.basicInfo}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.detail}>
            {age} tuổi - {readingLevel}
          </Text>
          {region ? <Text style={styles.detail}>{regionLabel[region]}</Text> : null}
        </View>
      </View>

      <View style={styles.goal}>
        <Text style={styles.goalLabel}>Mục tiêu tuần này</Text>
        <Text style={styles.goalValue}>{weeklyGoal} buổi luyện ngắn</Text>
      </View>

      <ScrollView style={styles.tagsContainer} scrollEnabled={supportNeeds.length + strengths.length + interests.length > 6}>
        <TagGroup title="Nhu cầu hỗ trợ" items={supportNeeds} style={styles.supportTag} />
        <TagGroup title="Điểm mạnh" items={strengths} style={styles.strengthTag} />
        <TagGroup title="Sở thích" items={interests} style={styles.interestTag} />
      </ScrollView>
    </SectionCard>
  );
}

function TagGroup({ title, items, style }: { title: string; items: string[]; style: object }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.tagGroup}>
      <Text style={styles.tagGroupTitle}>{title}</Text>
      <View style={styles.tags}>
        {items.map((item) => (
          <View key={item} style={[styles.tag, style]}>
            <Text style={styles.tagText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  basicInfo: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
  },
  detail: {
    fontSize: 13,
    color: colors.mutedText,
  },
  goal: {
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  goalLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.mutedText,
    textTransform: 'uppercase',
  },
  goalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  tagsContainer: {
    maxHeight: 200,
  },
  tagGroup: {
    gap: 8,
    marginBottom: 12,
  },
  tagGroupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.mutedText,
    textTransform: 'uppercase',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 12,
  },
  supportTag: {
    backgroundColor: '#FFF4E6',
    borderWidth: 1,
    borderColor: '#FFB84D',
  },
  strengthTag: {
    backgroundColor: '#E6F7FF',
    borderWidth: 1,
    borderColor: '#91D5FF',
  },
  interestTag: {
    backgroundColor: '#F6E6FF',
    borderWidth: 1,
    borderColor: '#D3ADF7',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.ink,
  },
});
