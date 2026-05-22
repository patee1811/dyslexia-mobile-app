import React, { useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import BottomTabBar from './src/components/BottomTabBar';
import { AppModelProvider, useAppModel } from './src/context/AppModel';
import CaregiverScreen from './src/screens/CaregiverScreen';
import HciScreen from './src/screens/HciScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import PrivacyScreen from './src/screens/PrivacyScreen';
import ReadingPracticeScreen from './src/screens/ReadingPracticeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { colors } from './src/theme/colors';
import type { AppTab } from './src/types';

function AppShell() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const { hydrated, authUser, authLoading } = useAppModel();

  const screen = useMemo(() => {
    switch (activeTab) {
      case 'practice':
        return <ReadingPracticeScreen />;
      case 'caregiver':
        return <CaregiverScreen onOpenPractice={() => setActiveTab('practice')} />;
      case 'hci':
        return <HciScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'privacy':
        return <PrivacyScreen />;
      case 'home':
      default:
        return <HomeScreen onOpenPractice={() => setActiveTab('practice')} onOpenCaregiver={() => setActiveTab('caregiver')} />;
    }
  }, [activeTab]);

  if (!hydrated || authLoading) {
    return (
      <SafeAreaView style={styles.loadingShell}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.shell} />
        <View style={styles.loadingInner}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Đang tải dữ liệu buổi học đã lưu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!authUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LoginScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.shell} />
      <View style={styles.container}>{screen}</View>
      <BottomTabBar activeTab={activeTab} onChange={setActiveTab} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AppModelProvider>
      <AppShell />
    </AppModelProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.shell,
  },
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  loadingShell: {
    flex: 1,
    backgroundColor: colors.shell,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingInner: {
    alignItems: 'center',
    gap: 14,
  },
  loadingText: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
});
