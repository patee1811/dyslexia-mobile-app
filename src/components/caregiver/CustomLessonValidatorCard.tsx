import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import SectionCard from '../SectionCard';
import { colors } from '../../theme/colors';

type ValidationWarning = {
  level: 'info' | 'warning' | 'suggestion';
  message: string;
};

type Props = {
  warnings: ValidationWarning[];
  isValid: boolean;
};

const levelConfig = {
  info: { color: '#2196F3', label: 'Thông tin' },
  warning: { color: '#D64A4A', label: 'Cẩn thận' },
  suggestion: { color: '#B86F2F', label: 'Gợi ý' },
};

export default function CustomLessonValidatorCard({ warnings, isValid }: Props) {
  if (warnings.length === 0 && isValid) {
    return (
      <SectionCard title="Kiểm tra bài tùy chỉnh" subtitle="Bài của bạn sẵn sàng">
        <View style={styles.successBox}>
          <Text style={styles.successText}>
            Bài này phù hợp để luyện. Bạn có thể thêm vào danh sách học.
          </Text>
        </View>
      </SectionCard>
    );
  }

  const infoWarnings = warnings.filter((warning) => warning.level === 'info');
  const cautionWarnings = warnings.filter((warning) => warning.level === 'warning');
  const suggestions = warnings.filter((warning) => warning.level === 'suggestion');

  return (
    <SectionCard title="Kiểm tra bài tùy chỉnh" subtitle="Phản hồi về độ dài, độ khó và mục tiêu luyện">
      <ScrollView style={styles.warningsList} scrollEnabled={warnings.length > 4}>
        {cautionWarnings.map((warning) => (
          <WarningItem key={warning.message} warning={warning} level="warning" />
        ))}
        {suggestions.map((warning) => (
          <WarningItem key={warning.message} warning={warning} level="suggestion" />
        ))}
        {infoWarnings.map((warning) => (
          <WarningItem key={warning.message} warning={warning} level="info" />
        ))}
      </ScrollView>

      {!isValid ? (
        <View style={styles.invalidBox}>
          <Text style={styles.invalidText}>Bài này chưa phù hợp. Vui lòng sửa các cảnh báo trước.</Text>
        </View>
      ) : null}
    </SectionCard>
  );
}

function WarningItem({
  warning,
  level,
}: {
  warning: ValidationWarning;
  level: 'info' | 'warning' | 'suggestion';
}) {
  const config = levelConfig[level];

  return (
    <View
      style={[
        styles.warningItem,
        {
          backgroundColor: level === 'warning' ? '#FFF5F5' : level === 'suggestion' ? '#FFF9E6' : '#F0F8FF',
          borderLeftColor: config.color,
        },
      ]}
    >
      <View style={styles.warningContent}>
        <Text style={[styles.warningLabel, { color: config.color }]}>{config.label}</Text>
        <Text style={styles.warningMessage}>{warning.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  warningsList: {
    maxHeight: 300,
    gap: 10,
  },
  warningItem: {
    flexDirection: 'row',
    gap: 10,
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
  },
  warningContent: {
    flex: 1,
    gap: 4,
  },
  warningLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  warningMessage: {
    fontSize: 13,
    color: colors.ink,
    lineHeight: 19,
  },
  successBox: {
    backgroundColor: '#F0FFF4',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#C6F6D5',
  },
  successText: {
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
    fontWeight: '500',
  },
  invalidBox: {
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FFD1D1',
  },
  invalidText: {
    fontSize: 13,
    color: '#C41C3B',
    fontWeight: '600',
    textAlign: 'center',
  },
});
