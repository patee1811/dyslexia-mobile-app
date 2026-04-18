import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { defaultPreferences, initialLearnerRecords, baseLessons, themeOptions } from '../data/content';
import {
  buildFocusWords,
  buildRewardMessage,
  buildShortReport,
  buildWeeklyStats,
  getRecommendation,
  mergeFlaggedWords,
  scoreSession,
} from '../lib/coach';
import { synthesizeAzureSpeechToFile } from '../lib/azureTts';
import type {
  CaregiverNote,
  LearnerRecord,
  Lesson,
  LessonDraft,
  PracticePreferences,
  SessionState,
  SpeechState,
} from '../types';

const STORAGE_KEY = 'dyslexia-mobile-app:v2';
const AZURE_SPEECH_KEY = process.env.EXPO_PUBLIC_AZURE_SPEECH_KEY?.trim();
const AZURE_SPEECH_REGION = process.env.EXPO_PUBLIC_AZURE_SPEECH_REGION?.trim();
const AZURE_SPEECH_VOICE = process.env.EXPO_PUBLIC_AZURE_SPEECH_VOICE?.trim() || 'vi-VN-HoaiMyNeural';

type PersistedState = {
  activeProfileId: string;
  learnerRecords: LearnerRecord[];
  lessons: Lesson[];
};

const AZURE_VOICE_LABELS: Record<PracticePreferences['azureVoice'], string> = {
  'vi-VN-HoaiMyNeural': 'HoaiMy',
  'vi-VN-NamMinhNeural': 'NamMinh',
};

type AppModelValue = {
  hydrated: boolean;
  learnerRecords: LearnerRecord[];
  activeProfileId: string;
  activeRecord: LearnerRecord;
  lessons: Lesson[];
  session: SessionState;
  speechState: SpeechState;
  currentTheme: (typeof themeOptions)[number];
  weeklyStats: ReturnType<typeof buildWeeklyStats>;
  focusWords: string[];
  recommendation: ReturnType<typeof getRecommendation>;
  shortReport: string;
  setActiveProfile: (profileId: string) => void;
  startLesson: (lessonId?: string) => void;
  selectLesson: (lessonId: string) => void;
  updatePreferences: (updater: (previous: PracticePreferences) => PracticePreferences) => void;
  cycleTheme: () => void;
  cycleReaderFont: () => void;
  setAzureVoice: (voice: PracticePreferences['azureVoice']) => void;
  setStep: (step: SessionState['step']) => void;
  toggleWarmupWord: (word: string) => void;
  toggleFlaggedWord: (word: string) => void;
  moveSentence: (direction: 1 | -1) => void;
  answerQuestion: (questionId: string, answerIndex: number) => void;
  setSessionNoteDraft: (text: string) => void;
  setFluencyRating: (value: number) => void;
  finishSession: () => void;
  restartLesson: () => void;
  addCaregiverNote: (text: string, lessonId?: string) => void;
  addLesson: (draft: LessonDraft) => void;
  advanceOnboarding: () => void;
  skipOnboarding: () => void;
  speakText: (text: string, mode?: 'word' | 'sentence') => void;
  stopSpeaking: () => Promise<void>;
};

const AppModelContext = createContext<AppModelValue | null>(null);

function createSession(lessonId: string): SessionState {
  return {
    lessonId,
    step: 'warmup',
    sentenceIndex: 0,
    openWarmupWords: [],
    flaggedWords: [],
    answers: {},
    completed: false,
    caregiverNoteDraft: '',
    fluencyRating: 3,
  };
}

function normalizeWord(raw: string) {
  return raw
    .toLowerCase()
    .replace(/[.,!?]/g, '')
    .trim();
}

function buildLessonFromDraft(draft: LessonDraft): Lesson {
  const sentences = draft.sentencesText
    .split(/\n|\./)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .map((sentence) => (sentence.endsWith('.') ? sentence : `${sentence}.`));

  const warmupWords = [...new Set(sentences.flatMap((sentence) => sentence.split(' ').map(normalizeWord)))]
    .filter((word) => word.length > 3)
    .slice(0, 3);

  return {
    id: `lesson-${Date.now()}`,
    title: draft.title,
    difficulty: 'building',
    topic: draft.topic,
    estimatedMinutes: Math.max(6, Math.min(sentences.length * 2, 12)),
    focusSkill: draft.focusSkill,
    coachGoal: `Luyện đọc về chủ đề ${draft.topic.toLowerCase()} với nhịp chậm, rõ và tự tin.`,
    warmup: warmupWords.map((word) => ({
      word,
      syllables: word,
      cue: 'Cho trẻ đọc chậm từ này 2 lần trước khi vào bài.',
      example: `Từ khóa cần chú ý: ${word}.`,
    })),
    sentences,
    questions: [
      {
        id: `question-${Date.now()}-1`,
        prompt: 'Bài đọc này tập trung vào chủ đề gì?',
        options: [draft.topic, 'Đi học hàng ngày', 'Một trò chơi khác'],
        answerIndex: 0,
        explanation: 'Câu hỏi này giúp trẻ nhắc lại chủ đề chính vừa đọc.',
      },
      {
        id: `question-${Date.now()}-2`,
        prompt: 'Nếu gặp từ khó, con nên làm gì?',
        options: ['Bỏ qua', 'Chạm vào từ rồi nghe mẫu', 'Đọc nhanh hơn'],
        answerIndex: 1,
        explanation: 'Luồng app khuyến khích chạm vào từ khó để nhận hỗ trợ ngay.',
      },
    ],
    caregiverTip: draft.caregiverTip || 'Sau buổi học, hỏi trẻ kể lại một ý chính trong 1 câu ngắn.',
    createdBy: 'caregiver',
  };
}

function getRecommendationForRecord(record: LearnerRecord, lessons: Lesson[]) {
  return getRecommendation(lessons, record.lessonProgress, buildFocusWords(record.lessonProgress, record.history));
}

function preprocessSpeechText(text: string, mode: 'word' | 'sentence') {
  const normalized = text
    .normalize('NFC')
    .replace(/\s+/g, ' ')
    .replace(/\//g, ' hoặc ')
    .replace(/-/g, ' ')
    .trim();

  if (mode === 'word') {
    return normalized.replace(/[.,!?;:]/g, '');
  }

  return normalized
    .replace(/([,;:])/g, '$1 ')
    .replace(/([.!?])/g, '$1 ');
}

function rankVietnameseVoice(voice: { language: string; quality?: string; name?: string }) {
  const language = voice.language.toLowerCase();
  const exactVietnamese = language === 'vi-vn' ? 4 : language.startsWith('vi') ? 2 : 0;
  const enhanced = voice.quality === 'Enhanced' ? 2 : 0;
  const nameBoost = /việt|vietnam/i.test(voice.name ?? '') ? 1 : 0;

  return exactVietnamese + enhanced + nameBoost;
}

function isAzureConfigured() {
  return Boolean(AZURE_SPEECH_KEY && AZURE_SPEECH_REGION);
}

function normalizeRecord(record: LearnerRecord): LearnerRecord {
  return {
    ...record,
    preferences: {
      ...defaultPreferences,
      ...record.preferences,
      azureVoice: record.preferences.azureVoice ?? defaultPreferences.azureVoice,
    },
  };
}

export function AppModelProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [activeProfileId, setActiveProfileId] = useState(initialLearnerRecords[0].profile.id);
  const [learnerRecords, setLearnerRecords] = useState<LearnerRecord[]>(initialLearnerRecords.map(normalizeRecord));
  const [lessons, setLessons] = useState<Lesson[]>(baseLessons);
  const [speechState, setSpeechState] = useState<SpeechState>({ speaking: false, text: null });
  const [preferredVoice, setPreferredVoice] = useState<{ identifier?: string; label?: string }>({});
  const [session, setSession] = useState<SessionState>(() => createSession(baseLessons[1]?.id ?? baseLessons[0].id));
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);

        if (!raw) {
          if (mounted) {
            setHydrated(true);
          }
          return;
        }

        const parsed = JSON.parse(raw) as PersistedState;

        if (mounted) {
          setActiveProfileId(parsed.activeProfileId);
          setLearnerRecords(parsed.learnerRecords.map(normalizeRecord));
          setLessons(parsed.lessons);
          const firstRecord = parsed.learnerRecords.find((record) => record.profile.id === parsed.activeProfileId) ?? parsed.learnerRecords[0];
          const recommendation = getRecommendationForRecord(firstRecord, parsed.lessons);
          setSession(createSession(recommendation.lessonId));
          setHydrated(true);
        }
      } catch {
        if (mounted) {
          setHydrated(true);
        }
      }
    }

    hydrate();

    return () => {
      mounted = false;
      void Speech.stop();
      if (soundRef.current) {
        void soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    Speech.getAvailableVoicesAsync()
      .then((voices) => {
        if (!mounted) {
          return;
        }

        const vietnameseVoices = voices
          .filter((voice) => voice.language.toLowerCase().startsWith('vi'))
          .sort((left, right) => rankVietnameseVoice(right) - rankVietnameseVoice(left));
        const vietnameseVoice = vietnameseVoices[0];
        setPreferredVoice({
          identifier: vietnameseVoice?.identifier,
          label: vietnameseVoice ? `${vietnameseVoice.name} (${vietnameseVoice.language})` : undefined,
        });
      })
      .catch(() => {
        if (mounted) {
          setPreferredVoice({});
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    void Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const payload: PersistedState = {
      activeProfileId,
      learnerRecords,
      lessons,
    };

    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [activeProfileId, hydrated, learnerRecords, lessons]);

  const activeRecord = useMemo(
    () => learnerRecords.find((record) => record.profile.id === activeProfileId) ?? learnerRecords[0],
    [activeProfileId, learnerRecords],
  );

  const currentTheme = useMemo(() => {
    return themeOptions.find((option) => option.id === activeRecord.preferences.themeId) ?? themeOptions[0];
  }, [activeRecord.preferences.themeId]);

  const focusWords = useMemo(
    () => buildFocusWords(activeRecord.lessonProgress, activeRecord.history),
    [activeRecord.history, activeRecord.lessonProgress],
  );

  const recommendation = useMemo(
    () => getRecommendation(lessons, activeRecord.lessonProgress, focusWords),
    [activeRecord.lessonProgress, focusWords, lessons],
  );

  const weeklyStats = useMemo(
    () => buildWeeklyStats(activeRecord.history, activeRecord.lessonProgress, activeRecord.profile.weeklyGoal),
    [activeRecord.history, activeRecord.lessonProgress, activeRecord.profile.weeklyGoal],
  );

  const shortReport = useMemo(
    () => buildShortReport(activeRecord.profile, activeRecord.history, focusWords, recommendation),
    [activeRecord.history, activeRecord.profile, focusWords, recommendation],
  );
  const currentAzureVoice = activeRecord.preferences.azureVoice || AZURE_SPEECH_VOICE;

  const updateActiveRecord = (updater: (record: LearnerRecord) => LearnerRecord) => {
    setLearnerRecords((previous) =>
      previous.map((record) => (record.profile.id === activeProfileId ? updater(record) : record)),
    );
  };

  const setActiveProfile = (profileId: string) => {
    const nextRecord = learnerRecords.find((record) => record.profile.id === profileId);

    if (!nextRecord) {
      return;
    }

    setActiveProfileId(profileId);
    const nextRecommendation = getRecommendationForRecord(nextRecord, lessons);
    setSession(createSession(nextRecommendation.lessonId));
  };

  const startLesson = (lessonId?: string) => {
    setSession(createSession(lessonId ?? recommendation.lessonId));
  };

  const selectLesson = (lessonId: string) => {
    setSession(createSession(lessonId));
  };

  const updatePreferences = (updater: (previous: PracticePreferences) => PracticePreferences) => {
    updateActiveRecord((record) => ({
      ...record,
      preferences: updater(record.preferences),
    }));
  };

  const cycleTheme = () => {
    updatePreferences((previous) => {
      const currentIndex = themeOptions.findIndex((option) => option.id === previous.themeId);
      const nextTheme = themeOptions[(currentIndex + 1) % themeOptions.length];

      return {
        ...previous,
        themeId: nextTheme.id,
      };
    });
  };

  const cycleReaderFont = () => {
    updatePreferences((previous) => {
      const nextFont =
        previous.readerFont === 'default' ? 'serif' : previous.readerFont === 'serif' ? 'mono' : 'default';

      return {
        ...previous,
        readerFont: nextFont,
        letterSpacing: nextFont === 'mono' ? 0.4 : nextFont === 'serif' ? 0.25 : 0.2,
      };
    });
  };

  const setAzureVoice = (voice: PracticePreferences['azureVoice']) => {
    updateActiveRecord((record) => ({
      ...record,
      preferences: {
        ...record.preferences,
        azureVoice: voice,
      },
    }));
  };

  const setStep = (step: SessionState['step']) => {
    setSession((previous) => ({
      ...previous,
      step,
    }));
  };

  const toggleWarmupWord = (word: string) => {
    setSession((previous) => ({
      ...previous,
      openWarmupWords: previous.openWarmupWords.includes(word)
        ? previous.openWarmupWords.filter((item) => item !== word)
        : [...previous.openWarmupWords, word],
    }));
  };

  const toggleFlaggedWord = (word: string) => {
    setSession((previous) => ({
      ...previous,
      flaggedWords: previous.flaggedWords.includes(word)
        ? previous.flaggedWords.filter((item) => item !== word)
        : [...previous.flaggedWords, word],
    }));
  };

  const moveSentence = (direction: 1 | -1) => {
    const selectedLesson = lessons.find((lesson) => lesson.id === session.lessonId) ?? lessons[0];

    setSession((previous) => ({
      ...previous,
      step: 'read',
      sentenceIndex: Math.min(
        Math.max(previous.sentenceIndex + direction, 0),
        Math.max(selectedLesson.sentences.length - 1, 0),
      ),
    }));
  };

  const answerQuestion = (questionId: string, answerIndex: number) => {
    setSession((previous) => ({
      ...previous,
      step: 'check',
      answers: {
        ...previous.answers,
        [questionId]: answerIndex,
      },
    }));
  };

  const setSessionNoteDraft = (text: string) => {
    setSession((previous) => ({
      ...previous,
      caregiverNoteDraft: text,
    }));
  };

  const setFluencyRating = (value: number) => {
    setSession((previous) => ({
      ...previous,
      fluencyRating: value,
    }));
  };

  const finishSession = () => {
    const selectedLesson = lessons.find((lesson) => lesson.id === session.lessonId) ?? lessons[0];
    const result = scoreSession(selectedLesson, session);
    const completedAt = new Date().toISOString();
    const reward = buildRewardMessage(result.accuracy, activeRecord.profile.rewardPoints);

    updateActiveRecord((record) => {
      const existing = record.lessonProgress.find((entry) => entry.lessonId === selectedLesson.id);
      const nextProgress = existing
        ? record.lessonProgress.map((entry) =>
            entry.lessonId === selectedLesson.id
              ? {
                  ...entry,
                  attempts: entry.attempts + 1,
                  bestAccuracy: Math.max(entry.bestAccuracy, result.accuracy),
                  lastCompletedAt: completedAt,
                  flaggedWords: mergeFlaggedWords(entry.flaggedWords, session.flaggedWords),
                }
              : entry,
          )
        : [
            ...record.lessonProgress,
            {
              lessonId: selectedLesson.id,
              attempts: 1,
              bestAccuracy: result.accuracy,
              lastCompletedAt: completedAt,
              flaggedWords: session.flaggedWords,
            },
          ];

      const nextHistory = [
        {
          id: `${record.profile.id}-${selectedLesson.id}-${completedAt}`,
          profileId: record.profile.id,
          lessonId: selectedLesson.id,
          lessonTitle: selectedLesson.title,
          date: completedAt,
          accuracy: result.accuracy,
          minutes: selectedLesson.estimatedMinutes,
          flaggedWords: session.flaggedWords,
          note:
            session.caregiverNoteDraft.trim() ||
            (result.correctAnswers === result.totalQuestions
              ? 'Hoàn thành tốt phần hiểu bài, có thể tăng độ khó dần.'
              : 'Nên đọc lại câu chứa từ khó và hỏi trẻ kể lại ý chính bằng lời của mình.'),
          fluencyRating: session.fluencyRating,
        },
        ...record.history,
      ];

      const nextNotes: CaregiverNote[] = session.caregiverNoteDraft.trim()
        ? [
            {
              id: `note-${completedAt}`,
              profileId: record.profile.id,
              lessonId: selectedLesson.id,
              createdAt: completedAt,
              text: session.caregiverNoteDraft.trim(),
            },
            ...record.notes,
          ]
        : record.notes;

      return {
        ...record,
        profile: {
          ...record.profile,
          rewardPoints: reward.total,
          latestBadge: reward.badge,
          streakDays: record.profile.streakDays + 1,
        },
        lessonProgress: nextProgress,
        history: nextHistory,
        notes: nextNotes,
      };
    });

    setSession((previous) => ({
      ...previous,
      step: 'review',
      completed: true,
      lastAccuracy: result.accuracy,
    }));
  };

  const restartLesson = () => {
    setSession(createSession(session.lessonId));
  };

  const addCaregiverNote = (text: string, lessonId?: string) => {
    if (!text.trim()) {
      return;
    }

    const createdAt = new Date().toISOString();

    updateActiveRecord((record) => ({
      ...record,
      notes: [
        {
          id: `manual-note-${createdAt}`,
          profileId: record.profile.id,
          lessonId,
          createdAt,
          text: text.trim(),
        },
        ...record.notes,
      ],
    }));
  };

  const addLesson = (draft: LessonDraft) => {
    if (!draft.title.trim() || !draft.sentencesText.trim()) {
      return;
    }

    const nextLesson = buildLessonFromDraft(draft);
    setLessons((previous) => [nextLesson, ...previous]);
    setSession(createSession(nextLesson.id));
  };

  const advanceOnboarding = () => {
    updateActiveRecord((record) => {
      const nextStep = record.onboarding.step + 1;

      return {
        ...record,
        onboarding: {
          step: nextStep,
          completed: nextStep >= 3,
        },
      };
    });
  };

  const skipOnboarding = () => {
    updateActiveRecord((record) => ({
      ...record,
      onboarding: {
        step: 3,
        completed: true,
      },
    }));
  };

  const stopAllSpeechPlayback = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
      } catch {
        // No-op when sound is already stopped.
      }

      try {
        await soundRef.current.unloadAsync();
      } catch {
        // No-op when sound is already unloaded.
      }

      soundRef.current = null;
    }

    try {
      await Speech.stop();
    } catch {
      // No-op when fallback speaker is not active.
    }
  };

  const speakText = (text: string, mode: 'word' | 'sentence' = 'sentence') => {
    if (!text.trim()) {
      return;
    }

    const preparedText = preprocessSpeechText(text, mode);

    const playFallbackTts = () => {
      Speech.speak(preparedText, {
        language: 'vi-VN',
        pitch: mode === 'word' ? 1.06 : 1.02,
        rate: mode === 'word' ? 0.8 : 0.84,
        voice: preferredVoice.identifier,
        onStart: () => {
          setSpeechState({
            speaking: true,
            text: preparedText,
            voiceLabel: preferredVoice.label ? `System ${preferredVoice.label}` : 'System TTS',
          });
        },
        onDone: () => {
          setSpeechState({
            speaking: false,
            text: null,
            voiceLabel: preferredVoice.label ? `System ${preferredVoice.label}` : 'System TTS',
          });
        },
        onStopped: () => {
          setSpeechState({
            speaking: false,
            text: null,
            voiceLabel: preferredVoice.label ? `System ${preferredVoice.label}` : 'System TTS',
          });
        },
        onError: () => {
          setSpeechState({
            speaking: false,
            text: null,
            voiceLabel: preferredVoice.label ? `System ${preferredVoice.label}` : 'System TTS',
          });
        },
      });
    };

    const run = async () => {
      await stopAllSpeechPlayback();

      if (isAzureConfigured()) {
        try {
          const ttsUri = await synthesizeAzureSpeechToFile({
            text: preparedText,
            mode,
            key: AZURE_SPEECH_KEY!,
            region: AZURE_SPEECH_REGION!,
            voice: currentAzureVoice,
          });

          const sound = new Audio.Sound();
          soundRef.current = sound;
          sound.setOnPlaybackStatusUpdate((status) => {
            if (!status.isLoaded) {
              return;
            }

            if (status.didJustFinish) {
              void sound.unloadAsync();

              if (soundRef.current === sound) {
                soundRef.current = null;
              }

              setSpeechState({
                speaking: false,
                text: null,
                voiceLabel: `Azure ${AZURE_VOICE_LABELS[currentAzureVoice]}`,
              });
            }
          });

          await sound.loadAsync({ uri: ttsUri }, { shouldPlay: true });
          setSpeechState({
            speaking: true,
            text: preparedText,
            voiceLabel: `Azure ${AZURE_VOICE_LABELS[currentAzureVoice]}`,
          });
          return;
        } catch {
          // Fall back to device TTS when Azure is unavailable.
        }
      }

      playFallbackTts();
    };

    void run();
  };

  const stopSpeaking = async () => {
    await stopAllSpeechPlayback();
    setSpeechState({
      speaking: false,
      text: null,
      voiceLabel: isAzureConfigured() ? `Azure ${AZURE_VOICE_LABELS[currentAzureVoice]}` : preferredVoice.label,
    });
  };

  const value = useMemo<AppModelValue>(
    () => ({
      hydrated,
      learnerRecords,
      activeProfileId,
      activeRecord,
      lessons,
      session,
      speechState,
      currentTheme,
      weeklyStats,
      focusWords,
      recommendation,
      shortReport,
      setActiveProfile,
      startLesson,
      selectLesson,
      updatePreferences,
      cycleTheme,
      cycleReaderFont,
      setAzureVoice,
      setStep,
      toggleWarmupWord,
      toggleFlaggedWord,
      moveSentence,
      answerQuestion,
      setSessionNoteDraft,
      setFluencyRating,
      finishSession,
      restartLesson,
      addCaregiverNote,
      addLesson,
      advanceOnboarding,
      skipOnboarding,
      speakText,
      stopSpeaking,
    }),
    [
      activeProfileId,
      activeRecord,
      currentTheme,
      currentAzureVoice,
      focusWords,
      hydrated,
      learnerRecords,
      lessons,
      recommendation,
      session,
      shortReport,
      speechState,
      weeklyStats,
    ],
  );

  return <AppModelContext.Provider value={value}>{children}</AppModelContext.Provider>;
}

export function useAppModel() {
  const context = useContext(AppModelContext);

  if (!context) {
    throw new Error('useAppModel must be used inside AppModelProvider');
  }

  return context;
}
