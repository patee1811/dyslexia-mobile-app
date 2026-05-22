import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import SectionCard from '../components/SectionCard';
import CustomLessonValidatorCard from '../components/caregiver/CustomLessonValidatorCard';
import ErrorSummaryCard from '../components/caregiver/ErrorSummaryCard';
import NextLessonCard from '../components/caregiver/NextLessonCard';
import SkillMasteryCard from '../components/caregiver/SkillMasteryCard';
import WeeklyProgressCard from '../components/caregiver/WeeklyProgressCard';
import ProfileCard from '../components/profile/ProfileCard';
import { useAppModel } from '../context/AppModel';
import { formatSessionDate } from '../lib/coach';
import { validateCustomLessonDraft } from '../lib/customLesson';
import type { SkillMastery } from '../lib/mastery';
import type { Lesson, LessonProgress, SessionHistoryEntry } from '../types';
import type { LessonSessionMetrics, ReadingErrorType } from '../types/progress';

type Props = {
  onOpenPractice: () => void;
};

export default function CaregiverScreen({ onOpenPractice }: Props) {
  const {
    activeRecord,
    currentTheme,
    lessons,
    recommendation,
    focusWords,
    shortReport,
    structuredRecommendation,
    caregiverInsights,
    skillMastery,
    lessonSessionMetrics,
    startLesson,
    addCaregiverNote,
    addLesson,
  } = useAppModel();

  const [noteDraft, setNoteDraft] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonTopic, setLessonTopic] = useState('');
  const [lessonFocus, setLessonFocus] = useState('');
  const [lessonSentences, setLessonSentences] = useState('');
  const [lessonTip, setLessonTip] = useState('');

  const { profile, history, lessonProgress, notes } = activeRecord;
  const latestSession = history[0];
  const recommendedLesson =
    lessons.find((lesson) => lesson.id === structuredRecommendation.lessonId) ??
    lessons.find((lesson) => lesson.id === recommendation.lessonId);

  const lessonValidation = validateCustomLessonDraft({
    title: lessonTitle,
    text: lessonSentences,
    focusSkill: lessonFocus,
    childReadingLevel: profile.readingLevel,
  });

  const actionSummary = useMemo(
    () => (caregiverInsights.length ? caregiverInsights.map((item) => `- ${item}`) : buildActionSummary(history, focusWords, recommendedLesson)),
    [caregiverInsights, focusWords, history, recommendedLesson],
  );

  const submitNote = () => {
    addCaregiverNote(noteDraft);
    setNoteDraft('');
  };

  const submitLesson = () => {
    if (!lessonValidation.isValid) {
      Alert.alert('Bài chưa phù hợp', 'Vui lòng sửa các cảnh báo trước khi tạo bài.');
      return;
    }

    addLesson({
      title: lessonTitle,
      topic: lessonTopic || 'Chủ đề mới',
      focusSkill: lessonFocus || 'Đọc chậm, rõ và giữ thứ tự chữ',
      sentencesText: lessonSentences,
      caregiverTip: lessonTip,
    });
    setLessonTitle('');
    setLessonTopic('');
    setLessonFocus('');
    setLessonSentences('');
    setLessonTip('');
  };

  return (
    <ScrollView style={{ backgroundColor: currentTheme.background }} contentContainerStyle={styles.content}>
      <ProfileCard
        name={profile.name}
        age={profile.age}
        readingLevel={profile.readingLevel}
        region={profile.region}
        supportNeeds={profile.supportNeeds}
        strengths={profile.strengths}
        interests={profile.interests}
        weeklyGoal={profile.weeklyGoal}
      />

      <SectionCard
        title="Tuần này cần ưu tiên"
        subtitle="Dashboard chỉ đưa gợi ý hỗ trợ luyện đọc, không dùng để chẩn đoán."
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
      >
        {actionSummary.map((item) => (
          <Text key={item} style={[styles.actionLine, { color: currentTheme.text }]}>
            {item}
          </Text>
        ))}
      </SectionCard>

      <SkillMasteryCard skills={buildStructuredSkillMastery(skillMastery, lessons, lessonProgress)} />

      <ErrorSummaryCard errors={buildMetricErrorSummary(lessonSessionMetrics, focusWords, history)} />

      <NextLessonCard
        title={structuredRecommendation.title}
        reason={structuredRecommendation.reason}
        difficulty={recommendedLesson?.difficulty ?? 'building'}
        focusSkill={recommendedLesson?.focusSkill}
        estimatedMinutes={recommendedLesson?.estimatedMinutes}
        onPress={() => {
          startLesson(structuredRecommendation.lessonId);
          onOpenPractice();
        }}
      />

      <WeeklyProgressCard weekData={buildWeekData(history)} weekGoal={Math.max(profile.weeklyGoal * 8, 1)} />

      <SectionCard
        title="Ghi chú của phụ huynh/giáo viên"
        subtitle="Ghi lại quan sát ngắn sau buổi học để chuẩn bị hỗ trợ lần sau."
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
      >
        <TextInput
          value={noteDraft}
          onChangeText={setNoteDraft}
          placeholder="Ví dụ: Con tập trung tốt hơn khi luyện trước giờ ngủ."
          placeholderTextColor={currentTheme.subtext}
          multiline
          style={[
            styles.textInput,
            {
              backgroundColor: '#FFFDF8',
              borderColor: currentTheme.border,
              color: currentTheme.text,
            },
          ]}
        />
        <PrimaryButton label="Lưu ghi chú" onPress={submitNote} disabled={!noteDraft.trim()} />
        <View style={styles.notesList}>
          {notes.slice(0, 4).map((note) => (
            <View key={note.id} style={[styles.noteCard, { backgroundColor: '#FFFDF8', borderColor: currentTheme.border }]}>
              <Text style={[styles.smallText, { color: currentTheme.accent }]}>{formatSessionDate(note.createdAt)}</Text>
              <Text style={[styles.note, { color: currentTheme.text }]}>{note.text}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard
        title="Tạo bài luyện tùy chỉnh"
        subtitle="Validator giúp giữ bài ngắn, rõ mục tiêu và phù hợp mức đọc của trẻ."
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
      >
        <TextInput
          value={lessonTitle}
          onChangeText={setLessonTitle}
          placeholder="Tên bài đọc"
          placeholderTextColor={currentTheme.subtext}
          style={[styles.input, { backgroundColor: '#FFFDF8', borderColor: currentTheme.border, color: currentTheme.text }]}
        />
        <TextInput
          value={lessonTopic}
          onChangeText={setLessonTopic}
          placeholder="Chủ đề"
          placeholderTextColor={currentTheme.subtext}
          style={[styles.input, { backgroundColor: '#FFFDF8', borderColor: currentTheme.border, color: currentTheme.text }]}
        />
        <TextInput
          value={lessonFocus}
          onChangeText={setLessonFocus}
          placeholder="Kỹ năng muốn luyện, ví dụ: dấu sắc/nặng"
          placeholderTextColor={currentTheme.subtext}
          style={[styles.input, { backgroundColor: '#FFFDF8', borderColor: currentTheme.border, color: currentTheme.text }]}
        />
        <TextInput
          value={lessonSentences}
          onChangeText={setLessonSentences}
          placeholder="Nhập 2-4 câu, mỗi câu một dòng hoặc ngăn bằng dấu chấm."
          placeholderTextColor={currentTheme.subtext}
          multiline
          style={[
            styles.textInput,
            {
              backgroundColor: '#FFFDF8',
              borderColor: currentTheme.border,
              color: currentTheme.text,
            },
          ]}
        />
        <TextInput
          value={lessonTip}
          onChangeText={setLessonTip}
          placeholder="Gợi ý cho phụ huynh sau buổi học"
          placeholderTextColor={currentTheme.subtext}
          style={[styles.input, { backgroundColor: '#FFFDF8', borderColor: currentTheme.border, color: currentTheme.text }]}
        />
        <CustomLessonValidatorCard warnings={lessonValidation.warnings} isValid={lessonValidation.isValid} />
        <PrimaryButton
          label="Tạo bài đọc mới"
          onPress={submitLesson}
          disabled={!lessonTitle.trim() || !lessonSentences.trim() || !lessonValidation.isValid}
        />
      </SectionCard>

      <SectionCard
        title="Báo cáo ngắn"
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
      >
        <View style={[styles.reportBox, { backgroundColor: '#FFFDF8', borderColor: currentTheme.border }]}>
          <Text style={[styles.reportText, { color: currentTheme.text }]}>{shortReport}</Text>
        </View>
      </SectionCard>

      <SectionCard
        title="Tiến độ theo bài đọc"
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
      >
        {lessons.map((lesson) => {
          const progress = lessonProgress.find((entry) => entry.lessonId === lesson.id);

          return (
            <View key={lesson.id} style={[styles.progressCard, { backgroundColor: '#FFFDF8', borderColor: currentTheme.border }]}>
              <Text style={[styles.progressTitle, { color: currentTheme.text }]}>{lesson.title}</Text>
              <Text style={[styles.note, { color: currentTheme.subtext }]}>{lesson.focusSkill}</Text>
              <Text style={[styles.smallText, { color: currentTheme.text }]}>
                {progress?.attempts ?? 0} lần luyện - tốt nhất {Math.round((progress?.bestAccuracy ?? 0) * 100)}%
              </Text>
              <Text style={[styles.smallText, { color: currentTheme.accent }]}>
                {progress?.flaggedWords.length ? `Từ cần ôn: ${progress.flaggedWords.join(', ')}` : 'Chưa có từ bị đánh dấu nhiều.'}
              </Text>
            </View>
          );
        })}
      </SectionCard>

      <SectionCard
        title="Lịch sử buổi học gần nhất"
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
      >
        {history.map((entry) => (
          <View key={entry.id} style={[styles.historyRow, { borderColor: currentTheme.border }]}>
            <View style={styles.historyMain}>
              <Text style={[styles.progressTitle, { color: currentTheme.text }]}>{entry.lessonTitle}</Text>
              <Text style={[styles.note, { color: currentTheme.subtext }]}>{formatSessionDate(entry.date)}</Text>
              <Text style={[styles.note, { color: currentTheme.text }]}>{entry.note}</Text>
            </View>
            <View style={[styles.scorePill, { backgroundColor: currentTheme.surfaceAlt }]}>
              <Text style={[styles.scoreValue, { color: currentTheme.text }]}>{Math.round(entry.accuracy * 100)}%</Text>
              <Text style={[styles.smallText, { color: currentTheme.subtext }]}>{entry.fluencyRating}/5</Text>
            </View>
          </View>
        ))}
      </SectionCard>

      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerTitle}>Lưu ý quan trọng</Text>
        <Text style={styles.disclaimerText}>
          Ứng dụng này được thiết kế để hỗ trợ trẻ luyện đọc dưới sự hướng dẫn của phụ huynh hoặc giáo viên.
          Ứng dụng không chẩn đoán rối loạn đọc và không thay thế chuyên gia. Nếu gia đình lo lắng về khả
          năng đọc của trẻ, hãy trao đổi với giáo viên, nhà tâm lý học hoặc chuyên gia âm ngữ trị liệu.
        </Text>
        {latestSession ? (
          <Text style={styles.disclaimerText}>
            Buổi gần nhất: {latestSession.lessonTitle}, {Math.round(latestSession.accuracy * 100)}% chính xác,
            mức lưu loát {latestSession.fluencyRating}/5.
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}

function buildActionSummary(history: SessionHistoryEntry[], focusWords: string[], lesson?: Lesson) {
  const errorSummary = buildErrorSummary(history);
  const topError = errorSummary[0];

  return [
    topError ? `- ${topError.type}: xuất hiện ${topError.count} lần.` : '- Kỹ năng đọc ổn hơn, tiếp tục luyện ngắn mỗi ngày.',
    focusWords.length ? `- Từ/vần cần nghe lại: ${focusWords.slice(0, 4).join(', ')}.` : '- Chưa có từ nào cần ưu tiên đặc biệt.',
    lesson ? `- Bài nên học tiếp: ${lesson.title}.` : '- Chọn một bài ngắn, quen thuộc để giữ nhịp luyện.',
    '- Nếu câu dài làm trẻ dừng lâu, hãy chia thành 2 câu ngắn hơn.',
  ];
}

function buildSkillMastery(lessons: Lesson[], progress: LessonProgress[]) {
  return lessons.slice(0, 4).map((lesson) => {
    const lessonProgress = progress.find((entry) => entry.lessonId === lesson.id);
    const attempts = lessonProgress?.attempts ?? 0;
    const masteryPercent = Math.round((lessonProgress?.bestAccuracy ?? 0) * 100);

    return {
      name: lesson.focusSkill,
      status:
        attempts === 0
          ? ('not-started' as const)
          : masteryPercent >= 82
            ? ('stable' as const)
            : masteryPercent >= 60
              ? ('in-practice' as const)
              : ('needs-review' as const),
      masteryPercent: attempts === 0 ? 0 : masteryPercent,
    };
  });
}

function labelSkill(skill: string) {
  if (skill.includes('tone')) {
    return 'Dấu thanh';
  }

  if (skill.includes('onset') || skill.includes('sound')) {
    return 'Âm đầu';
  }

  if (skill.includes('rime') || skill.includes('syllable')) {
    return 'Vần/ghép tiếng';
  }

  if (skill.includes('sentence')) {
    return 'Đọc câu ngắn';
  }

  if (skill.includes('comprehension')) {
    return 'Đọc hiểu';
  }

  if (skill.includes('spelling')) {
    return 'Quy tắc chính tả';
  }

  return skill;
}

function buildStructuredSkillMastery(
  mastery: SkillMastery[],
  lessons: Lesson[],
  progress: LessonProgress[],
) {
  if (mastery.length === 0) {
    return buildSkillMastery(lessons, progress);
  }

  return mastery
    .slice()
    .sort((left, right) => new Date(right.lastPracticedAt).getTime() - new Date(left.lastPracticedAt).getTime())
    .slice(0, 6)
    .map((entry) => {
      const lesson = lessons.find((item) => item.id === entry.patternKey);

      return {
        name: lesson ? `${labelSkill(entry.skill)} - ${lesson.title}` : labelSkill(entry.skill),
        status: entry.mastered
          ? ('stable' as const)
          : entry.recentAccuracy >= 80
            ? ('in-practice' as const)
            : ('needs-review' as const),
        masteryPercent: Math.round(entry.recentAccuracy),
      };
    });
}

const errorLabels: Record<ReadingErrorType, string> = {
  tone_error: 'Sai dấu thanh',
  onset_confusion: 'Nhầm âm đầu',
  rime_confusion: 'Nhầm vần',
  omission: 'Bỏ sót đáp án/từ',
  substitution: 'Chọn nhầm đáp án',
  slow_decoding: 'Đọc/giải mã còn chậm',
  needs_audio_prompt: 'Cần nghe mẫu nhiều',
  comprehension_error: 'Cần ôn đọc hiểu',
};

function suggestionForMetricError(type: ReadingErrorType) {
  if (type === 'tone_error') {
    return 'Cho con nghe lại từng cặp nắng/nặng, lá/lạ trước khi đọc câu.';
  }

  if (type === 'onset_confusion') {
    return 'Cho con chỉ vào âm đầu trước khi ghép cả tiếng.';
  }

  if (type === 'rime_confusion') {
    return 'Đọc chậm từng cặp vần như an/ang rồi đặt vào câu ngắn.';
  }

  if (type === 'comprehension_error') {
    return 'Sau mỗi câu, hỏi con kể lại bằng một ý ngắn.';
  }

  if (type === 'needs_audio_prompt') {
    return 'Cho con nghe mẫu một lần, rồi đọc lại chậm thay vì nghe liên tục.';
  }

  if (type === 'slow_decoding') {
    return 'Giảm độ dài câu và cho con nghỉ một nhịp giữa các cụm từ.';
  }

  return 'Ôn lại bằng từ ngắn, quen thuộc trước khi chuyển sang câu.';
}

function buildMetricErrorSummary(
  metrics: LessonSessionMetrics,
  focusWords: string[],
  history: SessionHistoryEntry[],
) {
  const errors = (Object.entries(metrics.errorSummary) as [ReadingErrorType, number][])
    .filter(([, count]) => count > 0)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([type, count]) => ({
      type: errorLabels[type],
      count,
      examples: focusWords.slice(0, 3),
      suggestion: suggestionForMetricError(type),
    }));

  return errors.length ? errors : buildErrorSummary(history);
}

function buildErrorSummary(history: SessionHistoryEntry[]) {
  const counts = new Map<string, { count: number; examples: string[] }>();

  history.slice(0, 4).forEach((entry) => {
    entry.flaggedWords.forEach((word) => {
      const key = classifyWord(word);
      const current = counts.get(key) ?? { count: 0, examples: [] };
      counts.set(key, {
        count: current.count + 1,
        examples: current.examples.includes(word) ? current.examples : [...current.examples, word],
      });
    });
  });

  return Array.from(counts.entries())
    .sort((left, right) => right[1].count - left[1].count)
    .slice(0, 3)
    .map(([type, value]) => ({
      type,
      count: value.count,
      examples: value.examples,
      suggestion: suggestionForError(type),
    }));
}

function classifyWord(word: string) {
  if (/[áắấéếíóốớúứý]/i.test(word) || /[ạặậẹệịọộợụựỵ]/i.test(word)) {
    return 'Sai dấu thanh';
  }

  if (/(an|ang|in|inh|on|ong|ên|ênh)$/i.test(word)) {
    return 'Nhầm vần gần nhau';
  }

  return 'Từ cần nghe lại';
}

function suggestionForError(type: string) {
  if (type === 'Sai dấu thanh') {
    return 'Cho con nghe lại từng cặp nắng/nặng, lá/lạ trước khi đọc câu. Hỏi nhẹ: âm cao hay thấp?';
  }

  if (type === 'Nhầm vần gần nhau') {
    return 'Đọc chậm từng cặp vần như an/ang, in/inh rồi mới đặt vào câu ngắn.';
  }

  return 'Cho con chạm vào từ để nghe mẫu, sau đó đọc lại trong một câu ngắn quen thuộc.';
}

function buildWeekData(history: SessionHistoryEntry[]) {
  const data = Array.from({ length: 7 }, (_, index) => ({
    day: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][index],
    minutes: 0,
    lessonsCompleted: 0,
    accuracy: undefined as number | undefined,
  }));

  history.forEach((entry) => {
    const date = new Date(entry.date);
    const dayOfWeek = date.getDay();
    const adjustedIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    if (adjustedIndex >= 0 && adjustedIndex < 7) {
      data[adjustedIndex].minutes += entry.minutes;
      data[adjustedIndex].lessonsCompleted += 1;
      data[adjustedIndex].accuracy = entry.accuracy * 100;
    }
  });

  return data;
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  actionLine: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '700',
  },
  note: {
    fontSize: 14,
    lineHeight: 22,
  },
  reportBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  reportText: {
    fontSize: 15,
    lineHeight: 23,
  },
  smallText: {
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textInput: {
    minHeight: 96,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    textAlignVertical: 'top',
    fontSize: 15,
    lineHeight: 22,
  },
  notesList: {
    gap: 10,
  },
  noteCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    gap: 4,
  },
  progressCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  historyRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  historyMain: {
    flex: 1,
    gap: 2,
  },
  scorePill: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '900',
  },
  disclaimerBox: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CCDDFF',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1976D2',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
});
