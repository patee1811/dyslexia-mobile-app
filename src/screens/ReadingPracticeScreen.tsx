import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import ProgressBar from '../components/ProgressBar';
import SectionCard from '../components/SectionCard';
import { useAppModel } from '../context/AppModel';
import { colors } from '../theme/colors';
import type { SessionState } from '../types';

const steps: SessionState['step'][] = ['warmup', 'read', 'check', 'review'];
const stepLabel: Record<SessionState['step'], string> = {
  warmup: 'Khởi động',
  read: 'Đọc',
  check: 'Hiểu bài',
  review: 'Ôn lại',
};

function cleanWord(raw: string) {
  return raw.toLowerCase().replace(/[.,!?]/g, '');
}

function getReaderFontFamily(font: 'default' | 'serif' | 'mono') {
  if (font === 'serif') {
    return 'serif';
  }

  if (font === 'mono') {
    return 'monospace';
  }

  return undefined;
}

export default function ReadingPracticeScreen() {
  const {
    activeRecord,
    lessons,
    session,
    currentTheme,
    recommendation,
    speechState,
    selectLesson,
    updatePreferences,
    cycleTheme,
    cycleReaderFont,
    setStep,
    toggleWarmupWord,
    toggleFlaggedWord,
    moveSentence,
    answerQuestion,
    setSessionNoteDraft,
    setFluencyRating,
    finishSession,
    restartLesson,
    speakText,
    stopSpeaking,
  } = useAppModel();

  const { profile, preferences, lessonProgress } = activeRecord;
  const lesson = lessons.find((item) => item.id === session.lessonId) ?? lessons[0];
  const currentSentence = lesson.sentences[session.sentenceIndex];
  const visibleSentences = preferences.focusMode
    ? [currentSentence]
    : lesson.sentences.slice(session.sentenceIndex, session.sentenceIndex + preferences.chunkSize);
  const currentProgress = (session.sentenceIndex + 1) / lesson.sentences.length;
  const allQuestionsAnswered = lesson.questions.every((question) => session.answers[question.id] !== undefined);
  const persistedProgress = lessonProgress.find((entry) => entry.lessonId === lesson.id);
  const readerFontFamily = getReaderFontFamily(preferences.readerFont);

  return (
    <ScrollView style={{ backgroundColor: currentTheme.background }} contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
        <Text style={[styles.smallLabel, { color: currentTheme.accent }]}>Buổi luyện cá nhân hóa cho {profile.name}</Text>
        <Text style={[styles.heroTitle, { color: currentTheme.text }]}>{lesson.title}</Text>
        <Text style={[styles.note, { color: currentTheme.subtext }]}>{lesson.coachGoal}</Text>
        <ProgressBar progress={currentProgress} fillColor={currentTheme.accent} />
        <View style={styles.heroRow}>
          <View style={[styles.heroMeta, { backgroundColor: currentTheme.accentSoft }]}>
            <Text style={[styles.metaText, { color: currentTheme.accent }]}>{lesson.focusSkill}</Text>
          </View>
          <View style={[styles.heroMeta, { backgroundColor: currentTheme.surfaceAlt }]}>
            <Text style={[styles.metaText, { color: currentTheme.text }]}>{lesson.estimatedMinutes} phút</Text>
          </View>
        </View>
        <Text style={[styles.micro, { color: currentTheme.subtext }]}>
          Gợi ý hệ thống: {recommendation.lessonId === lesson.id ? recommendation.reason : `Sau bài này có thể chuyển sang ${recommendation.title}.`}
        </Text>
      </View>

      <SectionCard title="Chọn bài luyện" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        <View style={styles.lessonPicker}>
          {lessons.map((item) => {
            const active = item.id === lesson.id;

            return (
              <Pressable
                key={item.id}
                onPress={() => selectLesson(item.id)}
                style={[
                  styles.lessonChip,
                  {
                    backgroundColor: active ? currentTheme.accent : currentTheme.surfaceAlt,
                    borderColor: active ? currentTheme.accent : currentTheme.border,
                  },
                ]}
              >
                <Text style={[styles.lessonChipTitle, { color: active ? colors.white : currentTheme.text }]}>{item.title}</Text>
                <Text style={[styles.lessonChipNote, { color: active ? '#FCEBDF' : currentTheme.subtext }]}>
                  tốt nhất {Math.round((lessonProgress.find((entry) => entry.lessonId === item.id)?.bestAccuracy ?? 0) * 100)}%
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard title="Công cụ hỗ trợ ngay trong buổi đọc" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        <View style={styles.controlRow}>
          <PrimaryButton
            label={speechState.speaking ? 'Dừng giọng đọc' : 'Nghe câu hiện tại'}
            onPress={() => (speechState.speaking ? void stopSpeaking() : speakText(currentSentence, 'sentence'))}
            secondary
            compact
          />
          <PrimaryButton label={`Nền: ${currentTheme.name}`} onPress={cycleTheme} secondary compact />
          <PrimaryButton label={`Font: ${preferences.readerFont}`} onPress={cycleReaderFont} secondary compact />
        </View>
        <View style={styles.controlRow}>
          <PrimaryButton
            label={preferences.focusMode ? 'Bỏ focus line' : 'Focus line'}
            onPress={() =>
              updatePreferences((previous) => ({
                ...previous,
                focusMode: !previous.focusMode,
              }))
            }
            secondary
            compact
          />
          <PrimaryButton
            label={preferences.superFocus ? 'Tắt siêu focus' : 'Siêu focus'}
            onPress={() =>
              updatePreferences((previous) => ({
                ...previous,
                superFocus: !previous.superFocus,
              }))
            }
            secondary
            compact
          />
          <PrimaryButton
            label={preferences.showSyllables ? 'Ẩn tách âm' : 'Bật tách âm'}
            onPress={() =>
              updatePreferences((previous) => ({
                ...previous,
                showSyllables: !previous.showSyllables,
              }))
            }
            secondary
            compact
          />
        </View>
        <View style={styles.controlRow}>
          <PrimaryButton
            label={`A${preferences.fontScale.toFixed(1)}`}
            onPress={() =>
              updatePreferences((previous) => ({
                ...previous,
                fontScale: previous.fontScale >= 1.5 ? 1 : Math.min(previous.fontScale + 0.1, 1.5),
              }))
            }
            secondary
            compact
          />
          <PrimaryButton
            label={`Dòng ${preferences.lineSpacing.toFixed(1)}`}
            onPress={() =>
              updatePreferences((previous) => ({
                ...previous,
                lineSpacing: previous.lineSpacing >= 1.6 ? 1.15 : Math.min(previous.lineSpacing + 0.08, 1.6),
              }))
            }
            secondary
            compact
          />
          <PrimaryButton
            label={`Chunk ${preferences.chunkSize}`}
            onPress={() =>
              updatePreferences((previous) => ({
                ...previous,
                chunkSize: previous.chunkSize === 1 ? 2 : 1,
              }))
            }
            secondary
            compact
          />
        </View>
        <Text style={[styles.micro, { color: currentTheme.subtext }]}>
          Font và khoảng cách được giữ riêng theo từng hồ sơ người học.
        </Text>
        <Text style={[styles.micro, { color: currentTheme.accent }]}>
          {speechState.voiceLabel
            ? `Giọng đang ưu tiên: ${speechState.voiceLabel}`
            : 'Chưa tìm thấy giọng tiếng Việt riêng trên thiết bị, app đang dùng giọng mặc định của hệ thống.'}
        </Text>
      </SectionCard>

      <SectionCard title="Các bước của buổi học" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        <View style={styles.stepRow}>
          {steps.map((step, index) => {
            const active = step === session.step;

            return (
              <Pressable
                key={step}
                onPress={() => setStep(step)}
                style={[
                  styles.stepCard,
                  {
                    backgroundColor: active ? currentTheme.accent : '#FFFDF8',
                    borderColor: active ? currentTheme.accent : currentTheme.border,
                  },
                ]}
              >
                <Text style={[styles.stepIndex, { color: active ? '#FCEBDF' : currentTheme.subtext }]}>{`0${index + 1}`}</Text>
                <Text style={[styles.stepTitle, { color: active ? colors.white : currentTheme.text }]}>{stepLabel[step]}</Text>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard
        title="1. Khởi động từ khó"
        subtitle="Chạm để mở gợi ý, nghe mẫu từ và xem ví dụ."
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
      >
        <View style={styles.warmupGrid}>
          {lesson.warmup.map((word) => {
            const open = session.openWarmupWords.includes(word.word);

            return (
              <View key={word.word} style={[styles.warmupCard, { backgroundColor: open ? currentTheme.surfaceAlt : '#FFFDF8', borderColor: currentTheme.border }]}>
                <Pressable onPress={() => toggleWarmupWord(word.word)} style={styles.warmupHeader}>
                  <Text style={[styles.warmupWord, { color: currentTheme.text }]}>{word.word}</Text>
                  <Text style={[styles.micro, { color: currentTheme.accent }]}>
                    {preferences.showSyllables ? word.syllables : 'Mở gợi ý'}
                  </Text>
                </Pressable>
                <View style={styles.controlRow}>
                  <PrimaryButton label="Nghe từ" onPress={() => speakText(word.word, 'word')} secondary compact />
                  <PrimaryButton label="Nghe ví dụ" onPress={() => speakText(word.example, 'sentence')} secondary compact />
                </View>
                {open ? (
                  <>
                    <Text style={[styles.note, { color: currentTheme.subtext }]}>{word.cue}</Text>
                    <Text style={[styles.micro, { color: currentTheme.text }]}>{word.example}</Text>
                  </>
                ) : null}
              </View>
            );
          })}
        </View>
        <PrimaryButton label="Sang phần đọc" onPress={() => setStep('read')} />
      </SectionCard>

      <SectionCard
        title="2. Đọc từng câu"
        subtitle="Chạm vào từ khó để đưa vào ôn lại. Có thể nghe mẫu từng câu ngay trên màn hình."
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
      >
        {preferences.superFocus ? (
          <View style={[styles.superFocusShell, { borderColor: currentTheme.border }]}>
            <View style={styles.maskBar} />
            <View style={[styles.superFocusCanvas, { backgroundColor: '#FFFDF8', borderColor: currentTheme.border }]}>
              <Text style={[styles.micro, { color: currentTheme.subtext }]}>
                Câu {session.sentenceIndex + 1}/{lesson.sentences.length}
              </Text>
              <Text
                style={[
                  styles.focusSentence,
                  {
                    color: currentTheme.text,
                    fontSize: 28 * preferences.fontScale,
                    lineHeight: 38 * preferences.fontScale * preferences.lineSpacing,
                    letterSpacing: preferences.letterSpacing,
                    fontFamily: readerFontFamily,
                  },
                ]}
              >
                {currentSentence}
              </Text>
            </View>
            <View style={styles.maskBar} />
          </View>
        ) : null}

        {visibleSentences.map((sentence, sentenceOffset) => (
          <View key={`${sentence}-${sentenceOffset}`} style={[styles.readingCanvas, { backgroundColor: '#FFFDF8', borderColor: currentTheme.border }]}>
            <Text style={[styles.micro, { color: currentTheme.subtext }]}>
              Câu {Math.min(session.sentenceIndex + sentenceOffset + 1, lesson.sentences.length)}/{lesson.sentences.length}
            </Text>
            <View style={styles.wordWrap}>
              {sentence.split(' ').map((rawWord, index) => {
                const normalized = cleanWord(rawWord);
                const flagged = session.flaggedWords.includes(normalized);
                const warmupWord = lesson.warmup.find((item) => item.word === normalized);

                return (
                  <Pressable
                    key={`${rawWord}-${index}`}
                    onPress={() => toggleFlaggedWord(normalized)}
                    onLongPress={() => speakText(normalized, 'word')}
                    style={[
                      styles.wordChip,
                      {
                        backgroundColor: flagged ? currentTheme.accentSoft : currentTheme.surface,
                        borderColor: flagged ? '#E7BCA2' : currentTheme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.readingWord,
                        {
                          color: currentTheme.text,
                          fontSize: 22 * preferences.fontScale,
                          lineHeight: 30 * preferences.fontScale * preferences.lineSpacing,
                          letterSpacing: preferences.letterSpacing,
                          fontFamily: readerFontFamily,
                        },
                      ]}
                    >
                      {rawWord}
                    </Text>
                    {preferences.showSyllables && warmupWord ? (
                      <Text style={[styles.micro, { color: currentTheme.accent }]}>{warmupWord.syllables}</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
        <View style={styles.controlRow}>
          <PrimaryButton label="Nghe câu này" onPress={() => speakText(currentSentence, 'sentence')} secondary compact />
          <PrimaryButton label="Câu trước" onPress={() => moveSentence(-1)} secondary compact disabled={session.sentenceIndex === 0} />
          <PrimaryButton
            label={session.sentenceIndex === lesson.sentences.length - 1 ? 'Đến hiểu bài' : 'Câu tiếp'}
            onPress={() => (session.sentenceIndex === lesson.sentences.length - 1 ? setStep('check') : moveSentence(1))}
            compact
          />
        </View>
        <Text style={[styles.micro, { color: currentTheme.subtext }]}>
          Nhấn giữ vào một từ để nghe đọc mẫu nhanh. Đã đánh dấu: {session.flaggedWords.length === 0 ? 'chưa có từ nào' : session.flaggedWords.join(', ')}.
        </Text>
      </SectionCard>

      <SectionCard
        title="3. Kiểm tra hiểu bài"
        subtitle="Mỗi câu hỏi đều phản hồi ngay để trẻ biết mình đang làm tốt ở đâu."
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
      >
        {lesson.questions.map((question) => {
          const selectedAnswer = session.answers[question.id];

          return (
            <View key={question.id} style={[styles.questionBlock, { backgroundColor: '#FFFDF8', borderColor: currentTheme.border }]}>
              <Text style={[styles.questionPrompt, { color: currentTheme.text }]}>{question.prompt}</Text>
              <View style={styles.optionList}>
                {question.options.map((option, index) => {
                  const active = selectedAnswer === index;
                  const correct = selectedAnswer !== undefined && index === question.answerIndex;
                  const wrong = active && index !== question.answerIndex;

                  return (
                    <Pressable
                      key={option}
                      onPress={() => answerQuestion(question.id, index)}
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor: correct ? currentTheme.accentSoft : active ? '#F6E8D8' : currentTheme.surface,
                          borderColor: wrong ? colors.danger : correct ? '#D6AE95' : currentTheme.border,
                        },
                      ]}
                    >
                      <Text style={[styles.optionText, { color: currentTheme.text }]}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {selectedAnswer !== undefined ? (
                <Text style={[styles.note, { color: selectedAnswer === question.answerIndex ? currentTheme.accent : colors.danger }]}>
                  {question.explanation}
                </Text>
              ) : null}
            </View>
          );
        })}
        <PrimaryButton label="Sang phần ôn lại" onPress={() => setStep('review')} secondary />
      </SectionCard>

      <SectionCard
        title="4. Ôn lại và lưu kết quả"
        subtitle="Ghi chú, chấm nhanh độ lưu loát và lưu báo cáo thật cho phụ huynh hoặc giáo viên."
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
      >
        <View style={styles.reviewStrip}>
          <View style={[styles.reviewTile, { backgroundColor: currentTheme.surfaceAlt }]}>
            <Text style={[styles.smallLabel, { color: currentTheme.subtext }]}>Kết quả tốt nhất trước đây</Text>
            <Text style={[styles.reviewValue, { color: currentTheme.text }]}>
              {Math.round((persistedProgress?.bestAccuracy ?? 0) * 100)}%
            </Text>
          </View>
          <View style={[styles.reviewTile, { backgroundColor: currentTheme.surfaceAlt }]}>
            <Text style={[styles.smallLabel, { color: currentTheme.subtext }]}>Từ đã đánh dấu</Text>
            <Text style={[styles.reviewValue, { color: currentTheme.text }]}>{session.flaggedWords.length}</Text>
          </View>
        </View>
        <View style={styles.chips}>
          {(session.flaggedWords.length > 0 ? session.flaggedWords : ['chưa có từ khó']).map((word) => (
            <View key={word} style={[styles.flagChip, { backgroundColor: currentTheme.accentSoft }]}>
              <Text style={[styles.flagChipText, { color: currentTheme.accent }]}>{word}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.smallLabel, { color: currentTheme.subtext }]}>Đánh giá lưu loát sau buổi học</Text>
        <View style={styles.ratingRow}>
          {[1, 2, 3, 4, 5].map((value) => {
            const active = value <= session.fluencyRating;

            return (
              <Pressable
                key={value}
                onPress={() => setFluencyRating(value)}
                style={[
                  styles.ratingChip,
                  {
                    backgroundColor: active ? currentTheme.accent : currentTheme.surfaceAlt,
                    borderColor: active ? currentTheme.accent : currentTheme.border,
                  },
                ]}
              >
                <Text style={[styles.ratingText, { color: active ? '#FFF9F0' : currentTheme.text }]}>{value}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.smallLabel, { color: currentTheme.subtext }]}>Ghi chú sau buổi học</Text>
        <TextInput
          value={session.caregiverNoteDraft}
          onChangeText={setSessionNoteDraft}
          placeholder="Ví dụ: Con đọc tốt hơn khi nghe mẫu từng câu."
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
        <Text style={[styles.note, { color: currentTheme.subtext }]}>{lesson.caregiverTip}</Text>

        {session.completed && session.lastAccuracy !== undefined ? (
          <View style={[styles.resultBanner, { backgroundColor: currentTheme.surfaceAlt, borderColor: currentTheme.border }]}>
            <Text style={[styles.smallLabel, { color: currentTheme.subtext }]}>Đã lưu buổi học</Text>
            <Text style={[styles.resultValue, { color: currentTheme.text }]}>{Math.round(session.lastAccuracy * 100)}%</Text>
            <Text style={[styles.micro, { color: currentTheme.accent }]}>
              Phần thưởng mới sẽ xuất hiện ở trang chủ và báo cáo sẽ cập nhật ở tab Theo dõi.
            </Text>
          </View>
        ) : null}

        <View style={styles.controlRow}>
          <PrimaryButton
            label={session.completed ? 'Làm lại bài này' : 'Lưu kết quả buổi học'}
            onPress={session.completed ? restartLesson : finishSession}
            disabled={!session.completed && !allQuestionsAnswered}
          />
          <PrimaryButton label="Quay lại hiểu bài" onPress={() => setStep('check')} secondary />
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
  hero: {
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  smallLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
  },
  note: {
    fontSize: 14,
    lineHeight: 22,
  },
  micro: {
    fontSize: 13,
    lineHeight: 19,
  },
  heroRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  heroMeta: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '800',
  },
  lessonPicker: {
    gap: 10,
  },
  lessonChip: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    gap: 4,
  },
  lessonChipTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  lessonChipNote: {
    fontSize: 13,
    fontWeight: '700',
  },
  controlRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  stepCard: {
    flexGrow: 1,
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    minWidth: '47%',
  },
  stepIndex: {
    fontSize: 11,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  warmupGrid: {
    gap: 10,
  },
  warmupCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
    gap: 8,
  },
  warmupHeader: {
    gap: 4,
  },
  warmupWord: {
    fontSize: 20,
    fontWeight: '900',
  },
  superFocusShell: {
    gap: 10,
  },
  maskBar: {
    height: 18,
    borderRadius: 999,
    backgroundColor: '#EADBC5',
    opacity: 0.8,
  },
  superFocusCanvas: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 18,
    gap: 10,
  },
  focusSentence: {
    fontWeight: '800',
  },
  readingCanvas: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    gap: 12,
  },
  wordWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  wordChip: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 2,
  },
  readingWord: {
    fontWeight: '700',
  },
  questionBlock: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  questionPrompt: {
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
  },
  optionList: {
    gap: 8,
  },
  optionButton: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  reviewStrip: {
    flexDirection: 'row',
    gap: 10,
  },
  reviewTile: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    gap: 6,
  },
  reviewValue: {
    fontSize: 28,
    fontWeight: '900',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flagChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  flagChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '800',
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
  resultBanner: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 4,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: '900',
  },
});
