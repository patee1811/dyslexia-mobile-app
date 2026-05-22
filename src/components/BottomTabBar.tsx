import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import type { AppTab } from '../types';

const tabs: { key: AppTab; label: string; shortLabel: string }[] = [
  { key: 'home', label: 'Hôm nay', shortLabel: '01' },
  { key: 'practice', label: 'Luyện đọc', shortLabel: '02' },
  { key: 'caregiver', label: 'Theo dõi', shortLabel: '03' },
  { key: 'hci', label: 'HCI', shortLabel: '04' },
  { key: 'settings', label: 'Cài đặt', shortLabel: '05' },
  { key: 'privacy', label: 'Riêng tư', shortLabel: '06' },
];

type Props = {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
};

export default function BottomTabBar({ activeTab, onChange }: Props) {
  return (
    <View style={styles.wrapper}>
      {tabs.map((tab) => {
        const active = tab.key === activeTab;

        return (
          <Pressable key={tab.key} onPress={() => onChange(tab.key)} style={[styles.tab, active && styles.activeTab]}>
            <Text style={[styles.shortLabel, active && styles.activeShortLabel]}>{tab.shortLabel}</Text>
            <Text style={[styles.label, active && styles.activeLabel]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: colors.shell,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8EFD9',
  },
  activeTab: {
    backgroundColor: colors.accent,
  },
  shortLabel: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  activeShortLabel: {
    color: '#F8EFD9',
  },
  label: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  activeLabel: {
    color: colors.white,
  },
});
