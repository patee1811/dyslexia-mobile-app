import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import ProgressBar from '../components/ProgressBar';
import SectionCard from '../components/SectionCard';
import { useAppModel } from '../context/AppModel';
import { homeHighlights, onboardingSteps } from '../data/content';

type Props = {
  onOpenPractice: () => void;
  onOpenCaregiver: () => void;
};

const difficultyLabel = {
  foundation: 'Nền tảng',
  building: 'Đang phát triển',
  stretch: 'Thử thách nhẹ',
};

export default function HomeScreen({ onOpenPractice, onOpenCaregiver }: Props) {
  const {
    learnerRecords,
    activeProfileId,
    activeRecord,
    lessons,
    currentTheme,
    weeklyStats,
    recommendation,
    setActiveProfile,
    startLesson,
    cycleTheme,
    cycleReaderFont,
    updatePreferences,
    advanceOnboarding,
    skipOnboarding,
  } = useAppModel();

  const { profile, preferences, lessonProgress, onboarding } = activeRecord;
  const goalProgress = Math.min(activeRecord.history.length / profile.weeklyGoal, 1);
  const onboardingStep = onboardingSteps[onboarding.step] ?? onboardingSteps[onboardingSteps.length - 1];

  return (
    <ScrollView style={{ backgroundColor: currentTheme.background }} contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
        <Text style={[styles.kicker, { color: currentTheme.accent }]}>Dyslexia Reading Coach</Text>
        <Text style={[styles.title, { color: currentTheme.text }]}>
          Ứng dụng hỗ trợ trẻ rối loạn đọc luyện đọc theo từng bước nhỏ.
        </Text>
        <Text style={[styles.subtitle, { color: currentTheme.subtext }]}>
          Dữ liệu đã được lưu cục bộ theo từng hồ sơ, có gợi ý bài tiếp theo, điều chỉnh giao diện và báo cáo ngắn cho phụ huynh hoặc giáo viên.
        </Text>
        <View style={styles.heroActions}>
          <PrimaryButton
            label={`Bắt đầu: ${recommendation.title}`}
            onPress={() => {
              startLesson(recommendation.lessonId);
              onOpenPractice();
            }}
          />
          <PrimaryButton label="Mở theo dõi" onPress={onOpenCaregiver} secondary />
        </View>
      </View>

      <SectionCard title="Chuyển hồ sơ người học" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        <View style={styles.profileSwitch}>
          {learnerRecords.map((record) => {
            const active = record.profile.id === activeProfileId;

            return (
              <Pressable
                key={record.profile.id}
                onPress={() => setActiveProfile(record.profile.id)}
                style={[
                  styles.profileCard,
                  {
                    backgroundColor: active ? currentTheme.accent : '#FFFDF8',
                    borderColor: active ? currentTheme.accent : currentTheme.border,
                  },
                ]}
              >
                <Text style={[styles.profileName, { color: active ? '#FFF9F0' : currentTheme.text }]}>
                  {record.profile.name}
                </Text>
                <Text style={[styles.smallNote, { color: active ? '#FCEBDF' : currentTheme.subtext }]}>
                  {record.profile.readingLevel}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      {!onboarding.completed ? (
        <SectionCard
          title={`Onboarding bước ${onboarding.step + 1}/3`}
          subtitle={onboardingStep.title}
          style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
        >
          <Text style={[styles.note, { color: currentTheme.subtext }]}>{onboardingStep.body}</Text>
          <View style={styles.controlRow}>
            <PrimaryButton label="Bước tiếp" onPress={advanceOnboarding} compact />
            <PrimaryButton label="Bỏ qua" onPress={skipOnboarding} secondary compact />
          </View>
        </SectionCard>
      ) : null}

      <SectionCard
        title="Buổi học gợi ý hôm nay"
        subtitle={recommendation.reason}
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
      >
        <View style={styles.inlineMeta}>
          <View style={[styles.metaPill, { backgroundColor: currentTheme.accentSoft }]}>
            <Text style={[styles.metaText, { color: currentTheme.accent }]}>{profile.calmMinutesTarget} phút</Text>
          </View>
          <View style={[styles.metaPill, { backgroundColor: currentTheme.surfaceAlt }]}>
            <Text style={[styles.metaText, { color: currentTheme.text }]}>
              Siêu tập trung {preferences.superFocus ? 'bật' : 'tắt'}
            </Text>
          </View>
        </View>
        <ProgressBar progress={goalProgress} fillColor={currentTheme.accent} />
        <Text style={[styles.note, { color: currentTheme.subtext }]}>
          Chuỗi luyện hiện tại: {profile.streakDays} ngày. Huy hiệu mới nhất: {profile.latestBadge ?? 'Chưa có'}.
        </Text>
        <View style={styles.controlRow}>
          <PrimaryButton
            label="Mở buổi học này"
            onPress={() => {
              startLesson(recommendation.lessonId);
              onOpenPractice();
            }}
          />
          <PrimaryButton
            label={preferences.superFocus ? 'Tắt siêu tập trung' : 'Bật siêu tập trung'}
            onPress={() =>
              updatePreferences((previous) => ({
                ...previous,
                superFocus: !previous.superFocus,
              }))
            }
            secondary
          />
        </View>
      </SectionCard>

      <SectionCard title="Tùy chỉnh hỗ trợ đọc" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        <View style={styles.controlRow}>
          <PrimaryButton label={`Nền: ${currentTheme.name}`} onPress={cycleTheme} secondary compact />
          <PrimaryButton label={`Font: ${preferences.readerFont}`} onPress={cycleReaderFont} secondary compact />
          <PrimaryButton
            label={`Khoảng chữ ${preferences.letterSpacing.toFixed(1)}`}
            onPress={() =>
              updatePreferences((previous) => ({
                ...previous,
                letterSpacing: previous.letterSpacing >= 0.6 ? 0.2 : previous.letterSpacing + 0.1,
              }))
            }
            secondary
            compact
          />
        </View>
        <Text style={[styles.note, { color: currentTheme.subtext }]}>
          Tùy chọn này giúp tiến gần hơn đến font và spacing thân thiện với trẻ gặp khó khăn khi đọc.
        </Text>
      </SectionCard>

      <SectionCard title="Hồ sơ người học" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        <Text style={[styles.profileHeading, { color: currentTheme.text }]}>
          {profile.name}, {profile.age} tuổi
        </Text>
        <Text style={[styles.note, { color: currentTheme.subtext }]}>{profile.readingLevel}</Text>
        <Text style={[styles.rewardText, { color: currentTheme.accent }]}>
          Điểm thưởng: {profile.rewardPoints} • Huy hiệu: {profile.latestBadge ?? 'Chưa có'}
        </Text>
        <View style={styles.chips}>
          {profile.supportNeeds.map((item) => (
            <View key={item} style={[styles.chip, { backgroundColor: currentTheme.surfaceAlt }]}>
              <Text style={[styles.chipText, { color: currentTheme.text }]}>{item}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Thư viện bài đọc" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        {lessons.map((lesson) => {
          const progress = lessonProgress.find((entry) => entry.lessonId === lesson.id);

          return (
            <Pressable
              key={lesson.id}
              onPress={() => {
                startLesson(lesson.id);
                onOpenPractice();
              }}
              style={[
                styles.lessonCard,
                { backgroundColor: lesson.id === recommendation.lessonId ? currentTheme.surfaceAlt : '#FFFDF8' },
              ]}
            >
              <View style={styles.lessonHeader}>
                <Text style={[styles.lessonTitle, { color: currentTheme.text }]}>{lesson.title}</Text>
                <View style={[styles.levelBadge, { backgroundColor: currentTheme.accentSoft }]}>
                  <Text style={[styles.levelText, { color: currentTheme.accent }]}>{difficultyLabel[lesson.difficulty]}</Text>
                </View>
              </View>
              <Text style={[styles.note, { color: currentTheme.subtext }]}>{lesson.focusSkill}</Text>
              <Text style={[styles.smallNote, { color: currentTheme.text }]}>
                {progress?.attempts ?? 0} lần luyện • tốt nhất {Math.round((progress?.bestAccuracy ?? 0) * 100)}%
              </Text>
            </Pressable>
          );
        })}
      </SectionCard>

      <SectionCard title="Theo dõi nhanh" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        <View style={styles.statsGrid}>
          {weeklyStats.map((item) => (
            <View key={item.label} style={[styles.statCard, { backgroundColor: '#FFFDF8', borderColor: currentTheme.border }]}>
              <Text style={[styles.smallNote, { color: currentTheme.subtext }]}>{item.label}</Text>
              <Text style={[styles.statValue, { color: currentTheme.text }]}>{item.value}</Text>
              <Text style={[styles.note, { color: currentTheme.accent }]}>{item.note}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Điểm hoàn thiện cho bài tập lớn" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        {homeHighlights.map((item) => (
          <View key={item.title} style={styles.highlightRow}>
            <Text style={[styles.highlightTitle, { color: currentTheme.text }]}>{item.title}</Text>
            <Text style={[styles.note, { color: currentTheme.subtext }]}>{item.body}</Text>
          </View>
        ))}
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
  hero: {
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    gap: 14,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
  },
  heroActions: {
    gap: 10,
  },
  profileSwitch: {
    gap: 10,
  },
  profileCard: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
  },
  smallNote: {
    fontSize: 13,
    fontWeight: '700',
  },
  note: {
    fontSize: 14,
    lineHeight: 21,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  inlineMeta: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  metaPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '800',
  },
  profileHeading: {
    fontSize: 22,
    fontWeight: '900',
  },
  rewardText: {
    fontSize: 15,
    fontWeight: '800',
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  lessonCard: {
    borderRadius: 20,
    padding: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: '#EBD8C4',
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'flex-start',
  },
  lessonTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
  },
  levelBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '800',
  },
  statsGrid: {
    gap: 10,
  },
  statCard: {
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '900',
  },
  highlightRow: {
    gap: 4,
    paddingVertical: 4,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
});
