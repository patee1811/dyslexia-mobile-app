import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import SectionCard from '../components/SectionCard';
import ReaderSettingsPanel from '../components/settings/ReaderSettingsPanel';
import { useAppModel } from '../context/AppModel';
import type { PracticePreferences } from '../types';

const voiceOptions: {
  id: PracticePreferences['azureVoice'];
  label: string;
  note: string;
  sample: string;
}[] = [
  {
    id: 'vi-VN-HoaiMyNeural',
    label: 'HoaiMy',
    note: 'Giọng nữ, dễ nghe và hợp cho bài đọc mẫu có nhịp chậm.',
    sample: 'Chào con, chúng ta cùng đọc chậm từng câu một nhé.',
  },
  {
    id: 'vi-VN-NamMinhNeural',
    label: 'NamMinh',
    note: 'Giọng nam, rõ nhạc và ổn định cho buổi luyện đọc dài hơn.',
    sample: 'Con hãy nhìn kỹ từng từ, sau đó đọc rõ và đều nhịp.',
  },
];

export default function SettingsScreen() {
  const { activeRecord, currentTheme, authUser, signOut, setAzureVoice, speakText, stopSpeaking, speechState } = useAppModel();
  const selectedVoice = activeRecord.preferences.azureVoice;
  const usingAzure = speechState.voiceLabel?.startsWith('Azure');

  return (
    <ScrollView style={{ backgroundColor: currentTheme.background }} contentContainerStyle={styles.content}>
      <SectionCard
        title="Cài đặt"
        subtitle="Tùy chọn này được lưu riêng theo từng hồ sơ. Bạn có thể đổi nhanh giữa hai giọng Azure mà không cần sửa `.env`."
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
      >
        <Text style={[styles.heading, { color: currentTheme.text }]}>{activeRecord.profile.name}</Text>
        <Text style={[styles.note, { color: currentTheme.subtext }]}>
          Trạng thái hiện tại: {speechState.voiceLabel ?? 'Chưa phát audio'}.
        </Text>
        <Text style={[styles.note, { color: usingAzure ? currentTheme.accent : currentTheme.subtext }]}>
          {usingAzure
            ? 'Azure Neural TTS đang được ưu tiên.'
            : 'Nếu chưa cấu hình Azure hoặc lỗi mạng, app sẽ fallback sang system TTS.'}
        </Text>
      </SectionCard>

      <SectionCard
        title="Tài khoản"
        subtitle="Đăng nhập Google dùng cho demo danh tính; dữ liệu bài học vẫn đang lưu cục bộ."
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
      >
        <Text style={[styles.heading, { color: currentTheme.text }]}>{authUser?.name ?? 'Chưa đăng nhập'}</Text>
        <Text style={[styles.note, { color: currentTheme.subtext }]}>
          {authUser?.guest ? 'Đang dùng chế độ demo offline.' : authUser?.email ?? 'Bạn có thể đăng nhập lại từ màn đăng nhập.'}
        </Text>
        <PrimaryButton label="Đăng xuất" onPress={() => void signOut()} secondary compact />
      </SectionCard>

      <ReaderSettingsPanel />

      <SectionCard title="Chọn giọng Azure" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        <View style={styles.voiceList}>
          {voiceOptions.map((voice) => {
            const active = voice.id === selectedVoice;

            return (
              <View
                key={voice.id}
                style={[
                  styles.voiceCard,
                  {
                    backgroundColor: active ? currentTheme.surfaceAlt : '#FFFDF8',
                    borderColor: active ? currentTheme.accent : currentTheme.border,
                  },
                ]}
              >
                <Pressable onPress={() => setAzureVoice(voice.id)} style={styles.voiceHeader}>
                  <View style={styles.voiceTitleWrap}>
                    <Text style={[styles.voiceTitle, { color: currentTheme.text }]}>{voice.label}</Text>
                    <Text style={[styles.note, { color: currentTheme.subtext }]}>{voice.note}</Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      {
                        borderColor: active ? currentTheme.accent : currentTheme.border,
                        backgroundColor: active ? currentTheme.accent : currentTheme.surface,
                      },
                    ]}
                  />
                </Pressable>
                <View style={styles.actions}>
                  <PrimaryButton label="Chọn giọng này" onPress={() => setAzureVoice(voice.id)} secondary compact />
                  <PrimaryButton label="Nghe thử" onPress={() => speakText(voice.sample, 'sentence')} compact />
                </View>
              </View>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard title="Mẫu test nhanh" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        <Text style={[styles.note, { color: currentTheme.subtext }]}>
          Dùng các nút dưới đây để nghe sự khác nhau sau khi chuyển giọng.
        </Text>
        <View style={styles.actions}>
          <PrimaryButton label="Nghe từ mẫu" onPress={() => speakText('thư viện', 'word')} secondary compact />
          <PrimaryButton
            label="Nghe câu mẫu"
            onPress={() => speakText('Hôm nay con đọc chậm, rõ và tự tin hơn hôm qua.', 'sentence')}
            compact
          />
          <PrimaryButton label="Dừng audio" onPress={() => void stopSpeaking()} secondary compact />
        </View>
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  heading: {
    fontSize: 24,
    fontWeight: '900',
  },
  note: {
    fontSize: 14,
    lineHeight: 22,
  },
  voiceList: {
    gap: 12,
  },
  voiceCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    gap: 10,
  },
  voiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voiceTitleWrap: {
    flex: 1,
    gap: 4,
  },
  voiceTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
