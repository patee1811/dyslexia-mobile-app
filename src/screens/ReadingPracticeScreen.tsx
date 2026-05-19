import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import ProgressBar from '../components/ProgressBar';
import BlendSyllableStep from '../components/practice/BlendSyllableStep';
import ComprehensionStep from '../components/practice/ComprehensionStep';
import ListenChooseStep from '../components/practice/ListenChooseStep';
import ReadSentenceStep from '../components/practice/ReadSentenceStep';
import ReadWordStep from '../components/practice/ReadWordStep';
import ReviewStep from '../components/practice/ReviewStep';
import SoundToLetterStep from '../components/practice/SoundToLetterStep';
import ToneMinimalPairStep from '../components/practice/ToneMinimalPairStep';
import type {
  BlendParts,
  ChoiceDetail,
  LessonTask,
  PracticeAnswerDraft,
  PracticeTaskKind,
  ReaderPreferences,
} from '../components/practice/types';
import { useAppModel } from '../context/AppModel';
import type { Lesson, SessionState, WarmupWord } from '../types';

const VIETNAMESE_INITIALS = [
  'ngh',
  'ng',
  'gh',
  'ch',
  'tr',
  'th',
  'ph',
  'kh',
  'nh',
  'gi',
  'qu',
  'đ',
  'b',
  'c',
  'd',
  'g',
  'h',
  'k',
  'l',
  'm',
  'n',
  'p',
  'r',
  's',
  't',
  'v',
  'x',
];

const FALLBACK_INITIALS = ['n', 'l', 'm', 'tr', 'th', 'ch'];
const FALLBACK_WORDS = ['nắng', 'lá', 'chậm', 'đọc', 'vui'];
const BASE_VOWELS = ['a', 'ă', 'â', 'e', 'ê', 'i', 'o', 'ô', 'ơ', 'u', 'ư', 'y'];

const TONE_MARKS = {
  sac: { a: 'á', ă: 'ắ', â: 'ấ', e: 'é', ê: 'ế', i: 'í', o: 'ó', ô: 'ố', ơ: 'ớ', u: 'ú', ư: 'ứ', y: 'ý' },
  huyen: { a: 'à', ă: 'ằ', â: 'ầ', e: 'è', ê: 'ề', i: 'ì', o: 'ò', ô: 'ồ', ơ: 'ờ', u: 'ù', ư: 'ừ', y: 'ỳ' },
  hoi: { a: 'ả', ă: 'ẳ', â: 'ẩ', e: 'ẻ', ê: 'ể', i: 'ỉ', o: 'ỏ', ô: 'ổ', ơ: 'ở', u: 'ủ', ư: 'ử', y: 'ỷ' },
  nga: { a: 'ã', ă: 'ẵ', â: 'ẫ', e: 'ẽ', ê: 'ễ', i: 'ĩ', o: 'õ', ô: 'ỗ', ơ: 'ỡ', u: 'ũ', ư: 'ữ', y: 'ỹ' },
  nang: { a: 'ạ', ă: 'ặ', â: 'ậ', e: 'ẹ', ê: 'ệ', i: 'ị', o: 'ọ', ô: 'ộ', ơ: 'ợ', u: 'ụ', ư: 'ự', y: 'ỵ' },
} as const;

type ToneAccentKey = keyof typeof TONE_MARKS;
type ToneKey = ToneAccentKey | 'ngang';

const TONE_LABELS: Record<ToneKey, string> = {
  ngang: 'không dấu',
  sac: 'dấu sắc',
  huyen: 'dấu huyền',
  hoi: 'dấu hỏi',
  nga: 'dấu ngã',
  nang: 'dấu nặng',
};

const MARKED_CHAR_INFO = buildMarkedCharInfo();

function buildMarkedCharInfo() {
  const result: Record<string, { base: string; tone: ToneAccentKey }> = {};

  (Object.keys(TONE_MARKS) as ToneAccentKey[]).forEach((tone) => {
    Object.entries(TONE_MARKS[tone]).forEach(([base, marked]) => {
      result[marked] = { base, tone };
    });
  });

  return result;
}

function cleanWord(raw: string) {
  return raw
    .normalize('NFC')
    .toLowerCase()
    .replace(/[.,!?;:"'()[\]{}]/g, '')
    .trim();
}

function uniqueValues(values: string[]) {
  const seen = new Set<string>();
  const output: string[] = [];

  values.forEach((value) => {
    const normalized = value.trim();

    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      output.push(normalized);
    }
  });

  return output;
}

function sentenceWords(lesson: Lesson) {
  return uniqueValues(
    lesson.sentences
      .flatMap((sentence) => sentence.split(/\s+/))
      .map(cleanWord)
      .filter((word) => word.length > 1),
  );
}

function stripTone(text: string) {
  return Array.from(text.normalize('NFC'))
    .map((char) => {
      const lower = char.toLowerCase();
      const info = MARKED_CHAR_INFO[lower];

      if (!info) {
        return char;
      }

      return char === lower ? info.base : info.base.toUpperCase();
    })
    .join('');
}

function isBaseVowel(char?: string) {
  return Boolean(char && BASE_VOWELS.includes(char.toLowerCase()));
}

function findFirstVowelIndex(text: string) {
  return Array.from(text).findIndex((char) => isBaseVowel(char));
}

function getToneInfo(text: string): { tone: ToneKey; index: number } {
  const chars = Array.from(text.normalize('NFC'));

  for (let index = 0; index < chars.length; index += 1) {
    const info = MARKED_CHAR_INFO[chars[index].toLowerCase()];

    if (info) {
      return { tone: info.tone, index };
    }
  }

  return { tone: 'ngang', index: findFirstVowelIndex(stripTone(text)) };
}

function applyTone(baseText: string, tone: ToneKey, preferredIndex?: number) {
  if (tone === 'ngang') {
    return baseText;
  }

  const chars = Array.from(baseText.normalize('NFC'));
  const index =
    preferredIndex !== undefined && isBaseVowel(chars[preferredIndex])
      ? preferredIndex
      : findFirstVowelIndex(baseText);

  if (index < 0) {
    return baseText;
  }

  const lower = chars[index].toLowerCase();
  const marked = (TONE_MARKS[tone] as Record<string, string>)[lower];

  if (!marked) {
    return baseText;
  }

  chars[index] = chars[index] === lower ? marked : marked.toUpperCase();
  return chars.join('');
}

function detectInitial(word: string) {
  const normalized = cleanWord(word);
  return VIETNAMESE_INITIALS.find((initial) => normalized.startsWith(initial)) ?? normalized[0] ?? '';
}

function buildBlendParts(word: string): BlendParts {
  const normalized = cleanWord(word) || word;
  const initial = detectInitial(normalized);
  const rime = normalized.slice(initial.length) || normalized;
  const tone = TONE_LABELS[getToneInfo(normalized).tone];

  return {
    initial,
    rime,
    tone,
    result: normalized,
  };
}

function arrangeChoices(target: string, rawChoices: string[], desiredCount: 3 | 4 = 4) {
  const normalizedTarget = target.trim();
  const candidates = uniqueValues([normalizedTarget, ...rawChoices, ...FALLBACK_WORDS]).slice(0, Math.max(desiredCount + 2, 5));
  const withoutTarget = candidates.filter((choice) => choice !== normalizedTarget);
  const targetSlot = Math.min(normalizedTarget.length % desiredCount, desiredCount - 1, withoutTarget.length);

  return [
    ...withoutTarget.slice(0, targetSlot),
    normalizedTarget,
    ...withoutTarget.slice(targetSlot),
  ].slice(0, desiredCount);
}

function buildWordChoices(target: string, warmupWords: WarmupWord[], lesson: Lesson) {
  return arrangeChoices(
    cleanWord(target),
    [...warmupWords.map((item) => cleanWord(item.word)), ...sentenceWords(lesson)],
    4,
  );
}

function buildLetterChoices(targetInitial: string, warmupWords: WarmupWord[]) {
  const initials = warmupWords.map((item) => detectInitial(item.word)).filter(Boolean);
  return arrangeChoices(targetInitial, [...initials, ...FALLBACK_INITIALS], 4);
}

function buildToneChoiceDetails(target: string): ChoiceDetail[] {
  const normalized = cleanWord(target);
  const base = stripTone(normalized);
  const toneInfo = getToneInfo(normalized);
  const tones: ToneKey[] = ['ngang', 'sac', 'huyen', 'nang', 'hoi', 'nga'];
  const generatedChoices = tones.map((tone) => applyTone(base, tone, toneInfo.index));
  const choices = arrangeChoices(normalized, generatedChoices, 3);

  return choices.map((value) => ({
    value,
    label: TONE_LABELS[getToneInfo(value).tone],
  }));
}

function getWarmupWords(lesson: Lesson): WarmupWord[] {
  if (lesson.warmup.length > 0) {
    return lesson.warmup;
  }

  const fallbackWords = sentenceWords(lesson).slice(0, 3);
  const words = fallbackWords.length > 0 ? fallbackWords : ['đọc'];

  return words.map((word) => ({
    word,
    syllables: word,
    cue: 'Đọc chậm từ này trước khi vào câu.',
    example: `Từ cần chú ý: ${word}.`,
  }));
}

function getReaderPreferences(preferences: ReaderPreferences): ReaderPreferences {
  return {
    fontScale: preferences.fontScale,
    lineSpacing: preferences.lineSpacing,
    letterSpacing: preferences.letterSpacing,
    readerFont: preferences.readerFont,
    focusMode: preferences.focusMode,
    superFocus: preferences.superFocus,
    showSyllables: preferences.showSyllables,
  };
}

function buildLessonTasks(
  lesson: Lesson,
  readerPreferences: ReaderPreferences,
  flaggedWords: string[],
  completed: boolean,
): LessonTask[] {
  const warmupWords = getWarmupWords(lesson);
  const firstWord = warmupWords[0];
  const firstWordText = cleanWord(firstWord.word);
  const firstParts = buildBlendParts(firstWordText);
  const toneChoices = buildToneChoiceDetails(firstWordText);
  const tasks: LessonTask[] = [
    {
      id: `listen-${lesson.id}-${firstWordText}`,
      kind: 'listen_choose',
      title: 'Nghe và chọn tiếng đúng',
      instruction: 'Con nghe tiếng mẫu, rồi chạm vào tiếng giống như con vừa nghe.',
      targetText: firstWordText,
      audioText: firstWordText,
      choices: buildWordChoices(firstWordText, warmupWords, lesson),
      correctAnswer: firstWordText,
    },
    {
      id: `sound-${lesson.id}-${firstParts.initial}`,
      kind: 'sound_to_letter',
      title: 'Nghe âm đầu',
      instruction: 'Con nghe âm đầu của tiếng, rồi chọn chữ hoặc cụm chữ đúng.',
      targetText: firstParts.initial,
      audioText: firstWordText,
      choices: buildLetterChoices(firstParts.initial, warmupWords),
      correctAnswer: firstParts.initial,
    },
    {
      id: `blend-${lesson.id}-${firstWordText}`,
      kind: 'blend_syllable',
      title: 'Ghép âm thành tiếng',
      instruction: 'Con nhìn từng phần của tiếng, nghe lại nếu cần, rồi chọn tiếng được ghép đúng.',
      targetText: firstWordText,
      audioText: firstWordText,
      choices: buildWordChoices(firstWordText, warmupWords, lesson).slice(0, 3),
      correctAnswer: firstWordText,
      parts: firstParts,
    },
    {
      id: `tone-${lesson.id}-${firstWordText}`,
      kind: 'tone_minimal_pair',
      title: 'Nghe và phân biệt dấu thanh',
      instruction: 'Con nghe tiếng mẫu, nhìn nhãn dấu thanh, rồi chọn tiếng đúng.',
      targetText: firstWordText,
      audioText: firstWordText,
      choices: toneChoices.map((choice) => choice.value),
      correctAnswer: firstWordText,
      choiceDetails: toneChoices,
    },
  ];

  warmupWords.forEach((word, index) => {
    const targetText = cleanWord(word.word);
    tasks.push({
      id: `word-${lesson.id}-${index}-${targetText}`,
      kind: 'read_word',
      title: 'Đọc một từ',
      instruction: 'Con đọc từ thật chậm. Nếu thấy khó, con có thể nghe mẫu hoặc đánh dấu để ôn lại.',
      targetText,
      audioText: targetText,
    });
  });

  lesson.sentences.forEach((sentence, index) => {
    tasks.push({
      id: `sentence-${lesson.id}-${index}`,
      kind: 'read_sentence',
      title: 'Đọc một câu',
      instruction: 'Con đọc từng từ trong câu. Có thể chạm vào từ để nghe từng từ.',
      sentence,
      targetText: sentence,
      audioText: sentence,
      sentenceIndex: index,
      totalSentences: lesson.sentences.length,
      readerPreferences,
      warmupWords,
      flaggedWords,
    });
  });

  lesson.questions.forEach((question, index) => {
    tasks.push({
      id: `comprehension-${question.id}`,
      kind: 'comprehension',
      title: 'Trả lời câu hỏi ngắn',
      instruction: 'Con đọc câu hỏi chậm, rồi chọn một đáp án.',
      questionId: question.id,
      prompt: question.prompt,
      options: question.options.slice(0, 3),
      answerIndex: question.answerIndex,
      explanation: question.explanation,
      targetText: question.prompt,
    });
  });

  tasks.push({
    id: `review-${lesson.id}`,
    kind: 'review',
    title: 'Ôn lại nhẹ nhàng',
    instruction: 'Mình nhìn lại phần cần ôn, không cần xem nhiều số liệu.',
    reviewWords: uniqueValues(flaggedWords),
    nextSuggestion: lesson.caregiverTip || 'Nghỉ một chút, rồi quay lại bài gợi ý ở trang chủ.',
    completed,
  });

  return tasks;
}

function sessionStepForTask(kind: PracticeTaskKind): SessionState['step'] {
  if (kind === 'comprehension') {
    return 'check';
  }

  if (kind === 'review') {
    return 'review';
  }

  if (kind === 'read_word' || kind === 'read_sentence') {
    return 'read';
  }

  return 'warmup';
}

export default function ReadingPracticeScreen() {
  const {
    activeRecord,
    lessons,
    session,
    currentTheme,
    speechState,
    setStep,
    toggleFlaggedWord,
    answerQuestion,
    finishSession,
    restartLesson,
    speakText,
    stopSpeaking,
  } = useAppModel();

  const { preferences } = activeRecord;
  const lesson = lessons.find((item) => item.id === session.lessonId) ?? lessons[0];
  const readerPreferences = useMemo(
    () => getReaderPreferences(preferences),
    [
      preferences.focusMode,
      preferences.fontScale,
      preferences.letterSpacing,
      preferences.lineSpacing,
      preferences.readerFont,
      preferences.showSyllables,
      preferences.superFocus,
    ],
  );
  const [taskIndex, setTaskIndex] = useState(0);
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, PracticeAnswerDraft>>({});

  const tasks = useMemo(
    () => buildLessonTasks(lesson, readerPreferences, session.flaggedWords, session.completed),
    [lesson, readerPreferences, session.completed, session.flaggedWords],
  );
  const currentTask = tasks[Math.min(taskIndex, tasks.length - 1)];
  const progress = tasks.length === 0 ? 0 : (taskIndex + 1) / tasks.length;

  useEffect(() => {
    setTaskIndex(0);
    setAnswerDrafts({});
  }, [session.lessonId]);

  useEffect(() => {
    if (taskIndex >= tasks.length) {
      setTaskIndex(Math.max(tasks.length - 1, 0));
    }
  }, [taskIndex, tasks.length]);

  useEffect(() => {
    const nextStep = sessionStepForTask(currentTask.kind);

    if (session.step !== nextStep) {
      setStep(nextStep);
    }
  }, [currentTask.kind, session.step, setStep]);

  const replayAudio = useCallback(
    (text: string) => {
      if (!text.trim()) {
        return;
      }

      speakText(text, text.trim().includes(' ') ? 'sentence' : 'word');
    },
    [speakText],
  );

  const handleAnswer = useCallback(
    (draft: PracticeAnswerDraft) => {
      setAnswerDrafts((previous) => ({
        ...previous,
        [draft.taskId]: draft,
      }));

      if (currentTask.kind === 'comprehension' && currentTask.questionId && draft.selectedAnswer) {
        const selectedIndex = (currentTask.options ?? []).findIndex((option) => option === draft.selectedAnswer);

        if (selectedIndex >= 0) {
          answerQuestion(currentTask.questionId, selectedIndex);
        }
      }

      if (draft.supportUsed?.includes('flagged_word') && currentTask.targetText) {
        const word = cleanWord(currentTask.targetText);

        if (word && !session.flaggedWords.includes(word)) {
          toggleFlaggedWord(word);
        }
      }

      if (draft.supportUsed?.includes('flagged_sentence') && currentTask.sentence) {
        const warmupSet = new Set(getWarmupWords(lesson).map((word) => cleanWord(word.word)));
        const wordsToFlag = currentTask.sentence
          .split(/\s+/)
          .map(cleanWord)
          .filter((word) => warmupSet.has(word) && !session.flaggedWords.includes(word));

        uniqueValues(wordsToFlag).forEach(toggleFlaggedWord);
      }
    },
    [answerQuestion, currentTask, lesson, session.flaggedWords, toggleFlaggedWord],
  );

  const allQuestionsAnswered = useMemo(() => {
    return lesson.questions.every((question) => {
      const draft = answerDrafts[`comprehension-${question.id}`];
      return session.answers[question.id] !== undefined || draft?.selectedAnswer !== undefined;
    });
  }, [answerDrafts, lesson.questions, session.answers]);

  const goNext = useCallback(() => {
    if (currentTask.kind === 'review') {
      if (session.completed) {
        restartLesson();
        setTaskIndex(0);
        setAnswerDrafts({});
      } else {
        finishSession();
      }

      return;
    }

    const nextIndex = Math.min(taskIndex + 1, tasks.length - 1);
    const nextTask = tasks[nextIndex];

    if (nextTask.kind === 'review' && !session.completed && allQuestionsAnswered) {
      finishSession();
    }

    setTaskIndex(nextIndex);
  }, [allQuestionsAnswered, currentTask.kind, finishSession, restartLesson, session.completed, taskIndex, tasks]);

  const commonStepProps = {
    task: currentTask,
    taskIndex,
    totalTasks: tasks.length,
    onAnswer: handleAnswer,
    onNext: goNext,
    onReplayAudio: replayAudio,
  };

  const renderTask = () => {
    switch (currentTask.kind) {
      case 'listen_choose':
        return <ListenChooseStep {...commonStepProps} />;
      case 'sound_to_letter':
        return <SoundToLetterStep {...commonStepProps} />;
      case 'blend_syllable':
        return <BlendSyllableStep {...commonStepProps} />;
      case 'tone_minimal_pair':
        return <ToneMinimalPairStep {...commonStepProps} />;
      case 'read_word':
        return <ReadWordStep {...commonStepProps} />;
      case 'read_sentence':
        return <ReadSentenceStep {...commonStepProps} />;
      case 'comprehension':
        return <ComprehensionStep {...commonStepProps} />;
      case 'review':
      default:
        return <ReviewStep {...commonStepProps} />;
    }
  };

  return (
    <ScrollView style={{ backgroundColor: currentTheme.background }} contentContainerStyle={styles.content}>
      <View style={[styles.progressShell, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.lessonLabel, { color: currentTheme.accent }]}>Bài: {lesson.title}</Text>
          <Text style={[styles.lessonMeta, { color: currentTheme.subtext }]}>{lesson.estimatedMinutes} phút</Text>
        </View>
        <ProgressBar progress={progress} fillColor={currentTheme.accent} />
      </View>

      <View style={[styles.taskShell, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
        {renderTask()}
      </View>

      {speechState.speaking ? (
        <View style={[styles.audioStatus, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
          <View style={styles.audioStatusTextGroup}>
            <Text style={[styles.audioStatusTitle, { color: currentTheme.text }]}>Đang đọc mẫu</Text>
            <Text style={[styles.audioStatusText, { color: currentTheme.subtext }]} numberOfLines={2}>
              {speechState.text}
            </Text>
          </View>
          <PrimaryButton label="Dừng" onPress={() => void stopSpeaking()} secondary compact />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 14,
    paddingBottom: 32,
  },
  progressShell: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  lessonLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '900',
  },
  lessonMeta: {
    fontSize: 13,
    fontWeight: '800',
  },
  taskShell: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#70482E',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  audioStatus: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  audioStatusTextGroup: {
    flex: 1,
    gap: 2,
  },
  audioStatusTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  audioStatusText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
