import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import ProgressBar from '../components/ProgressBar';
import SectionCard from '../components/SectionCard';
import { useAppModel } from '../context/AppModel';
import { formatSessionDate } from '../lib/coach';

type Props = {
  onOpenPractice: () => void;
};

export default function CaregiverScreen({ onOpenPractice }: Props) {
  const {
    activeRecord,
    currentTheme,
    lessons,
    weeklyStats,
    recommendation,
    focusWords,
    shortReport,
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
  const averageAccuracy =
    history.length === 0 ? 0 : history.reduce((sum, entry) => sum + entry.accuracy, 0) / history.length;

  const submitNote = () => {
    addCaregiverNote(noteDraft);
    setNoteDraft('');
  };

  const submitLesson = () => {
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
      <SectionCard
        title="Bảng theo dõi phụ huynh / giáo viên"
        subtitle="Dữ liệu ở đây được lưu thật trên máy và tách riêng theo từng hồ sơ người học."
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
      >
        <Text style={[styles.heroName, { color: currentTheme.text }]}>
          {profile.name} • mục tiêu {profile.weeklyGoal} buổi / tuần
        </Text>
        <ProgressBar progress={Math.min(history.length / profile.weeklyGoal, 1)} fillColor={currentTheme.accent} />
        <Text style={[styles.note, { color: currentTheme.subtext }]}>
          Độ chính xác trung bình gần đây: {Math.round(averageAccuracy * 100)}%. Điểm thưởng tích lũy: {profile.rewardPoints}.
        </Text>
        <PrimaryButton
          label={`Mở lại bài gợi ý: ${recommendation.title}`}
          onPress={() => {
            startLesson(recommendation.lessonId);
            onOpenPractice();
          }}
        />
      </SectionCard>

      <SectionCard title="Báo cáo ngắn ngay trong app" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        <View style={[styles.reportBox, { backgroundColor: '#FFFDF8', borderColor: currentTheme.border }]}>
          <Text style={[styles.reportText, { color: currentTheme.text }]}>{shortReport}</Text>
        </View>
      </SectionCard>

      <SectionCard title="Tóm tắt tuần này" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        <View style={styles.statsGrid}>
          {weeklyStats.map((item) => (
            <View key={item.label} style={[styles.statCard, { backgroundColor: '#FFFDF8', borderColor: currentTheme.border }]}>
              <Text style={[styles.smallText, { color: currentTheme.subtext }]}>{item.label}</Text>
              <Text style={[styles.statValue, { color: currentTheme.text }]}>{item.value}</Text>
              <Text style={[styles.note, { color: currentTheme.accent }]}>{item.note}</Text>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard title="Từ cần ưu tiên ôn lại" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        <View style={styles.chips}>
          {focusWords.length === 0 ? (
            <Text style={[styles.note, { color: currentTheme.subtext }]}>Chưa có từ nào cần ưu tiên.</Text>
          ) : (
            focusWords.map((word) => (
              <View key={word} style={[styles.wordChip, { backgroundColor: currentTheme.accentSoft }]}>
                <Text style={[styles.wordChipText, { color: currentTheme.accent }]}>{word}</Text>
              </View>
            ))
          )}
        </View>
        <Text style={[styles.note, { color: currentTheme.subtext }]}>
          Đây là phần adaptive interaction: từ nào bị đánh dấu lặp lại sẽ được ưu tiên trong gợi ý bài sau.
        </Text>
      </SectionCard>

      <SectionCard title="Thêm ghi chú sau buổi học" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
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

      <SectionCard title="Phụ huynh tự thêm bài đọc" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
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
          placeholder="Kỹ năng muốn luyện"
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
        <PrimaryButton label="Tạo bài đọc mới" onPress={submitLesson} disabled={!lessonTitle.trim() || !lessonSentences.trim()} />
      </SectionCard>

      <SectionCard title="Tiến độ theo bài đọc" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        {lessons.map((lesson) => {
          const progress = lessonProgress.find((entry) => entry.lessonId === lesson.id);

          return (
            <View key={lesson.id} style={[styles.progressCard, { backgroundColor: '#FFFDF8', borderColor: currentTheme.border }]}>
              <Text style={[styles.progressTitle, { color: currentTheme.text }]}>{lesson.title}</Text>
              <Text style={[styles.note, { color: currentTheme.subtext }]}>{lesson.focusSkill}</Text>
              <Text style={[styles.smallText, { color: currentTheme.text }]}>
                {progress?.attempts ?? 0} lần luyện • tốt nhất {Math.round((progress?.bestAccuracy ?? 0) * 100)}%
              </Text>
              <Text style={[styles.smallText, { color: currentTheme.accent }]}>
                {progress?.flaggedWords.length ? `Từ cần ôn: ${progress.flaggedWords.join(', ')}` : 'Chưa có từ bị đánh dấu nhiều.'}
              </Text>
            </View>
          );
        })}
      </SectionCard>

      <SectionCard title="Lịch sử buổi học gần nhất" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
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

      <SectionCard title="Khuyến nghị can thiệp nhẹ" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        <Text style={[styles.note, { color: currentTheme.text }]}>
          1. Bắt đầu bằng bài {recommendation.title} vì đây là bài phù hợp nhất với mức hỗ trợ hiện tại.
        </Text>
        <Text style={[styles.note, { color: currentTheme.text }]}>
          2. Sau buổi đọc, yêu cầu trẻ kể lại 1 ý chính thay vì đọc lại toàn văn để giảm áp lực.
        </Text>
        <Text style={[styles.note, { color: currentTheme.text }]}>
          3. Nếu trẻ dừng quá lâu ở một từ, cho nghe mẫu từng câu rồi quay lại đọc cùng nhịp chậm.
        </Text>
        {latestSession ? (
          <Text style={[styles.note, { color: currentTheme.accent }]}>
            Buổi gần nhất: {latestSession.lessonTitle} với {Math.round(latestSession.accuracy * 100)}% độ chính xác và {latestSession.fluencyRating}/5 độ lưu loát.
          </Text>
        ) : null}
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
  heroName: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
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
  statsGrid: {
    gap: 10,
  },
  statCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  smallText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  wordChipText: {
    fontSize: 13,
    fontWeight: '800',
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
});
