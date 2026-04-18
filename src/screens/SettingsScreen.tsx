import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import SectionCard from '../components/SectionCard';
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
    note: 'Giong nu, de nghe va hop cho bai doc mau co nhip cham.',
    sample: 'Chao con, chung ta cung doc cham tung cau mot nhe.',
  },
  {
    id: 'vi-VN-NamMinhNeural',
    label: 'NamMinh',
    note: 'Giong nam, ro nhac va on dinh cho huynh luyen doc dai hon.',
    sample: 'Con hay nhin ky tung tu, sau do doc ro va deu nhip.',
  },
];

export default function SettingsScreen() {
  const { activeRecord, currentTheme, setAzureVoice, speakText, stopSpeaking, speechState } = useAppModel();
  const selectedVoice = activeRecord.preferences.azureVoice;
  const usingAzure = speechState.voiceLabel?.startsWith('Azure');

  return (
    <ScrollView style={{ backgroundColor: currentTheme.background }} contentContainerStyle={styles.content}>
      <SectionCard
        title="Settings"
        subtitle="Tuy chon nay duoc luu rieng theo tung ho so. Ban co the doi nhanh giua hai giong Azure ma khong can sua `.env`."
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
      >
        <Text style={[styles.heading, { color: currentTheme.text }]}>{activeRecord.profile.name}</Text>
        <Text style={[styles.note, { color: currentTheme.subtext }]}>
          Trang thai hien tai: {speechState.voiceLabel ?? 'Chua phat audio'}.
        </Text>
        <Text style={[styles.note, { color: usingAzure ? currentTheme.accent : currentTheme.subtext }]}>
          {usingAzure
            ? 'Azure Neural TTS dang duoc uu tien.'
            : 'Neu chua cau hinh Azure hoac loi mang, app se fallback sang system TTS.'}
        </Text>
      </SectionCard>

      <SectionCard title="Chon giong Azure" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
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
                  <PrimaryButton label="Chon giong nay" onPress={() => setAzureVoice(voice.id)} secondary compact />
                  <PrimaryButton label="Nghe thu" onPress={() => speakText(voice.sample, 'sentence')} compact />
                </View>
              </View>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard title="Mau test nhanh" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        <Text style={[styles.note, { color: currentTheme.subtext }]}>
          Dung cac nut duoi day de nghe su khac nhau sau khi chuyen giong.
        </Text>
        <View style={styles.actions}>
          <PrimaryButton label="Nghe tu mau" onPress={() => speakText('thu vien', 'word')} secondary compact />
          <PrimaryButton
            label="Nghe cau mau"
            onPress={() => speakText('Hom nay con doc cham, ro va tu tin hon hom qua.', 'sentence')}
            compact
          />
          <PrimaryButton label="Dung audio" onPress={() => void stopSpeaking()} secondary compact />
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
