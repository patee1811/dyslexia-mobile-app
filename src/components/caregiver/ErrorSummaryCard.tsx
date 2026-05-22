import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SectionCard from '../SectionCard';
import { colors } from '../../theme/colors';

type ErrorType = {
  type: string;
  count: number;
  examples?: string[];
  suggestion: string;
};

type Props = {
  errors: ErrorType[];
};

export default function ErrorSummaryCard({ errors }: Props) {
  return (
    <SectionCard title="Lỗi lặp lại" subtitle="Những loại lỗi cần chú ý trong các buổi gần đây">
      <View style={styles.errorsList}>
        {errors.length === 0 ? (
          <Text style={styles.emptyText}>Con đang tiến bộ. Chưa có lỗi lặp lại nào cần ưu tiên.</Text>
        ) : (
          errors.map((error) => (
            <View key={error.type} style={styles.errorBlock}>
              <View style={styles.errorHeader}>
                <Text style={styles.errorTitle}>{error.type}</Text>
                <Text style={styles.errorCount}>{error.count} lần</Text>
              </View>

              {error.examples && error.examples.length > 0 ? (
                <View style={styles.examplesRow}>
                  <Text style={styles.examplesLabel}>Ví dụ:</Text>
                  <Text style={styles.examplesText}>
                    {error.examples.slice(0, 3).join(', ')}
                    {error.examples.length > 3 ? '...' : ''}
                  </Text>
                </View>
              ) : null}

              <View style={styles.suggestionBox}>
                <Text style={styles.suggestionLabel}>Gợi ý phụ huynh:</Text>
                <Text style={styles.suggestionText}>{error.suggestion}</Text>
              </View>
            </View>
          ))
        )}
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  errorsList: {
    gap: 14,
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  errorBlock: {
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    flex: 1,
  },
  errorCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9A5B00',
  },
  examplesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  examplesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedText,
  },
  examplesText: {
    fontSize: 12,
    color: colors.ink,
    fontStyle: 'italic',
    flex: 1,
  },
  suggestionBox: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 4,
  },
  suggestionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B25300',
  },
  suggestionText: {
    fontSize: 13,
    color: colors.ink,
    lineHeight: 19,
  },
});
