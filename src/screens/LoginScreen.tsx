import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import SectionCard from '../components/SectionCard';
import { useAppModel } from '../context/AppModel';
import { colors } from '../theme/colors';

export default function LoginScreen() {
  const { authLoading, authError, signInWithGoogle, continueAsGuest } = useAppModel();

  return (
    <View style={styles.shell}>
      <SectionCard
        title="Đăng nhập"
        subtitle="Dùng Google OAuth để đồng bộ danh tính demo. Dữ liệu luyện đọc vẫn lưu cục bộ trên thiết bị trong bản prototype."
        style={styles.card}
      >
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>D</Text>
          </View>
          <View style={styles.brandText}>
            <Text style={styles.appName}>Dyslexia Reading Coach</Text>
            <Text style={styles.appSubtext}>Luyện đọc ngắn, nghe mẫu và theo dõi tiến bộ.</Text>
          </View>
        </View>

        {authError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        ) : null}

        {authLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.loadingText}>Đang kiểm tra phiên đăng nhập...</Text>
          </View>
        ) : null}

        <PrimaryButton label="Đăng nhập với Google" onPress={() => void signInWithGoogle()} disabled={authLoading} />
        <PrimaryButton label="Tiếp tục demo offline" onPress={continueAsGuest} secondary disabled={authLoading} />

        <View style={styles.noteBox}>
          <Text style={styles.noteTitle}>Lưu ý</Text>
          <Text style={styles.noteText}>
            App hỗ trợ luyện đọc, không chẩn đoán. Không nhập dữ liệu nhạy cảm của trẻ vào phần demo nếu chưa có
            đồng ý của phụ huynh/giáo viên.
          </Text>
        </View>
      </SectionCard>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: colors.appBackground,
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    borderRadius: 24,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '900',
  },
  brandText: {
    flex: 1,
    gap: 4,
  },
  appName: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '900',
  },
  appSubtext: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  errorBox: {
    borderRadius: 16,
    backgroundColor: '#FFF1E7',
    borderWidth: 1,
    borderColor: '#E0B29E',
    padding: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 20,
  },
  loadingRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.mutedText,
    fontSize: 14,
    fontWeight: '700',
  },
  noteBox: {
    borderRadius: 16,
    backgroundColor: colors.sky,
    padding: 12,
    gap: 4,
  },
  noteTitle: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  noteText: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 19,
  },
});
