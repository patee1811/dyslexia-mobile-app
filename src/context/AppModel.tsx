import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Linking, Platform } from 'react-native';
import { defaultPreferences, initialLearnerRecords, curriculumLessons, themeOptions } from '../data/content';
import {
  buildFocusWords,
  buildRewardMessage,
  buildCaregiverInsight,
  buildShortReport,
  buildWeeklyStats,
  getRecommendation,
  mergeFlaggedWords,
} from '../lib/coach';
import {
  calculateLessonSessionMetrics,
  classifyError,
} from '../lib/progress';
import {
  updateSkillMastery,
  type SkillMastery,
  type StructuredLesson,
} from '../lib/mastery';
import {
  getNextLessonRecommendation,
  type StructuredLessonRecommendation,
} from '../lib/adaptive';
import { deleteAllLocalData, deleteChildData } from '../lib/privacy';
import { speak as speakWithTts, stop as stopTts, subscribeTts } from '../lib/tts';
import type {
  LessonSessionMetrics,
  PracticeAnswer,
  PracticeAnswerDraft,
} from '../types/progress';
import type {
  CaregiverNote,
  AuthUser,
  LearnerRecord,
  Lesson,
  LessonDraft,
  PracticePreferences,
  SessionState,
  SpeechState,
} from '../types';

const STORAGE_KEY = 'dyslexia-mobile-app:v2';
const AUTH_TOKEN_KEY = 'dyslexia-mobile-app:auth-token';
const AZURE_SPEECH_KEY = process.env.EXPO_PUBLIC_AZURE_SPEECH_KEY?.trim();
const AZURE_SPEECH_REGION = process.env.EXPO_PUBLIC_AZURE_SPEECH_REGION?.trim();
const AZURE_SPEECH_VOICE = process.env.EXPO_PUBLIC_AZURE_SPEECH_VOICE?.trim() || 'vi-VN-HoaiMyNeural';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || 'http://localhost:4000';

type PersistedState = {
  activeProfileId: string;
  learnerRecords: LearnerRecord[];
  lessons: Lesson[];
  practiceAnswers?: PracticeAnswer[];
  skillMastery?: SkillMastery[];
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
  practiceAnswers: PracticeAnswer[];
  skillMastery: SkillMastery[];
  recordPracticeAnswer: (answerDraft: PracticeAnswerDraft) => void;
  completeStructuredLesson: () => void;
  structuredRecommendation: StructuredLessonRecommendation;
  lessonSessionMetrics: LessonSessionMetrics;
  caregiverInsights: string[];
  authUser: AuthUser | null;
  authLoading: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
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
  deleteActiveChildData: () => Promise<void>;
  deleteAllAppData: () => Promise<void>;
  advanceOnboarding: () => void;
  skipOnboarding: () => void;
  speakText: (text: string, mode?: 'word' | 'sentence') => void;
  stopSpeaking: () => Promise<void>;
};

const AppModelContext = createContext<AppModelValue | null>(null);

function createSession(lessonId: string): SessionState {
  return {
    startedAt: new Date().toISOString(),
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

function mergeLessonCatalog(storedLessons?: Lesson[]) {
  if (!storedLessons?.length) {
    return curriculumLessons;
  }

  const curriculumIds = new Set(curriculumLessons.map((lesson) => lesson.id));
  const customLessons = storedLessons.filter((lesson) => lesson.createdBy === 'caregiver' || !curriculumIds.has(lesson.id));

  return [...curriculumLessons, ...customLessons];
}

function apiUrl(path: string) {
  return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
}

function parseQuery(search: string) {
  const query = search.startsWith('?') ? search.slice(1) : search;
  return query.split('&').reduce<Record<string, string>>((params, pair) => {
    if (!pair) {
      return params;
    }

    const [rawKey, rawValue = ''] = pair.split('=');
    params[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.replace(/\+/g, ' '));
    return params;
  }, {});
}

function readWebAuthRedirect() {
  if (Platform.OS !== 'web') {
    return {};
  }

  const globalScope = globalThis as typeof globalThis & {
    location?: { search?: string; pathname?: string };
    history?: { replaceState?: (data: unknown, unused: string, url?: string) => void };
  };
  const params = parseQuery(globalScope.location?.search ?? '');

  if (params.authToken || params.authError) {
    globalScope.history?.replaceState?.(null, '', globalScope.location?.pathname ?? '/');
  }

  return {
    authToken: params.authToken,
    authError: params.authError,
  };
}

async function loadAuthUser(token: string): Promise<AuthUser> {
  const response = await fetch(apiUrl('/api/auth/session'), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('auth_session_invalid');
  }

  const payload = (await response.json()) as { user: AuthUser };
  return payload.user;
}

function buildPracticeAnswerId(answer: Pick<PracticeAnswer, 'profileId' | 'lessonId' | 'taskId'> & { attemptId?: string }) {
  return `${answer.profileId}-${answer.lessonId}-${answer.attemptId ?? 'legacy'}-${answer.taskId}`;
}

function answersForLesson(answers: PracticeAnswer[], profileId: string, lessonId?: string) {
  return answers.filter((answer) => answer.profileId === profileId && (!lessonId || answer.lessonId === lessonId));
}

function answersForSession(answers: PracticeAnswer[], profileId: string, lessonId: string, startedAt: string) {
  const startedAtMs = new Date(startedAt).getTime();

  return answersForLesson(answers, profileId, lessonId).filter((answer) => {
    const createdAtMs = new Date(answer.createdAt).getTime();
    return Number.isFinite(createdAtMs) && createdAtMs >= startedAtMs;
  });
}

function answersFromSession(lesson: Lesson, session: SessionState, profileId: string, createdAt: string) {
  return lesson.questions.map((question, index): PracticeAnswer => {
    const selectedIndex = session.answers[question.id];
    const selectedAnswer = selectedIndex === undefined ? undefined : question.options[selectedIndex];
    const correctAnswer = question.options[question.answerIndex];
    const isCorrect = selectedIndex === question.answerIndex;

    return {
      id: buildPracticeAnswerId({ profileId, lessonId: lesson.id, taskId: question.id, attemptId: session.startedAt }),
      profileId,
      lessonId: lesson.id,
      taskId: question.id,
      taskIndex: index,
      taskType: 'comprehension',
      selectedAnswer,
      correctAnswer,
      isCorrect,
      errorTypes: classifyError({
        taskType: 'comprehension',
        selectedAnswer,
        correctAnswer,
      }),
      createdAt,
    };
  });
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

function resolveSystemSpeechRate(mode: 'word' | 'sentence', preference: PracticePreferences['speechRate']) {
  if (mode === 'word') {
    return preference === 'very_slow' ? 0.58 : preference === 'normal' ? 0.82 : 0.7;
  }

  return preference === 'very_slow' ? 0.48 : preference === 'normal' ? 0.78 : 0.62;
}

function normalizeRecord(record: LearnerRecord): LearnerRecord {
  return {
    ...record,
    profile: {
      ...record.profile,
      region: record.profile.region ?? 'north',
    },
    preferences: {
      ...defaultPreferences,
      ...record.preferences,
      azureVoice: record.preferences.azureVoice ?? defaultPreferences.azureVoice,
      allowCloud: record.preferences.allowCloud ?? defaultPreferences.allowCloud,
      speechRate: record.preferences.speechRate ?? defaultPreferences.speechRate,
      voiceMode: record.preferences.voiceMode ?? defaultPreferences.voiceMode,
      reduceMotion: record.preferences.reduceMotion ?? defaultPreferences.reduceMotion,
    },
  };
}

function resetLearnerRecordData(record: LearnerRecord): LearnerRecord {
  return normalizeRecord({
    ...record,
    profile: {
      ...record.profile,
      streakDays: 0,
      rewardPoints: 0,
      latestBadge: undefined,
    },
    lessonProgress: [],
    history: [],
    notes: [],
    onboarding: {
      step: 0,
      completed: false,
    },
  });
}

export function AppModelProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [activeProfileId, setActiveProfileId] = useState(initialLearnerRecords[0].profile.id);
  const [learnerRecords, setLearnerRecords] = useState<LearnerRecord[]>(initialLearnerRecords.map(normalizeRecord));
  const [lessons, setLessons] = useState<Lesson[]>(curriculumLessons);
  const [practiceAnswers, setPracticeAnswers] = useState<PracticeAnswer[]>([]);
  const [skillMastery, setSkillMastery] = useState<SkillMastery[]>([]);
  const [speechState, setSpeechState] = useState<SpeechState>({ speaking: false, text: null });
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionState>(() =>
    createSession(curriculumLessons[0]?.id ?? 'tone-ngang-sac-01'),
  );

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        const redirect = readWebAuthRedirect();
        const storedAuthToken = redirect.authToken ?? (await AsyncStorage.getItem(AUTH_TOKEN_KEY));
        setAuthError(redirect.authError ?? null);

        if (storedAuthToken) {
          try {
            const user = await loadAuthUser(storedAuthToken);

            if (mounted) {
              setAuthToken(storedAuthToken);
              setAuthUser(user);
              await AsyncStorage.setItem(AUTH_TOKEN_KEY, storedAuthToken);
            }
          } catch {
            await AsyncStorage.removeItem(AUTH_TOKEN_KEY);

            if (mounted) {
              setAuthToken(null);
              setAuthUser(null);
              setAuthError(redirect.authError ?? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            }
          }
        }

        const raw = await AsyncStorage.getItem(STORAGE_KEY);

        if (!raw) {
          if (mounted) {
            setHydrated(true);
            setAuthLoading(false);
          }
          return;
        }

        const parsed = JSON.parse(raw) as PersistedState;

        if (mounted) {
          setActiveProfileId(parsed.activeProfileId);
          setLearnerRecords(parsed.learnerRecords.map(normalizeRecord));
          const nextLessons = mergeLessonCatalog(parsed.lessons);
          setLessons(nextLessons);
          setPracticeAnswers(parsed.practiceAnswers ?? []);
          setSkillMastery(parsed.skillMastery ?? []);
          const firstRecord = parsed.learnerRecords.find((record) => record.profile.id === parsed.activeProfileId) ?? parsed.learnerRecords[0];
          const recommendation = getRecommendationForRecord(firstRecord, nextLessons);
          setSession(createSession(recommendation.lessonId));
          setHydrated(true);
          setAuthLoading(false);
        }
      } catch {
        if (mounted) {
          setHydrated(true);
          setAuthLoading(false);
        }
      }
    }

    hydrate();

    return () => {
      mounted = false;
      void stopTts();
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    const payload: PersistedState = {
      activeProfileId,
      learnerRecords,
      lessons,
      practiceAnswers,
      skillMastery,
    };

    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [activeProfileId, hydrated, learnerRecords, lessons, practiceAnswers, skillMastery]);

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
  const currentLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === session.lessonId) ?? lessons[0],
    [lessons, session.lessonId],
  );
  const currentLessonAnswers = useMemo(
    () => {
      const persistedAnswers = answersForSession(practiceAnswers, activeProfileId, session.lessonId, session.startedAt);
      return persistedAnswers.length
        ? persistedAnswers
        : answersFromSession(currentLesson, session, activeProfileId, '1970-01-01T00:00:00.000Z');
    },
    [activeProfileId, currentLesson, practiceAnswers, session],
  );
  const lessonSessionMetrics = useMemo(
    () => calculateLessonSessionMetrics(currentLessonAnswers),
    [currentLessonAnswers],
  );
  const structuredRecommendation = useMemo(
    () =>
      getNextLessonRecommendation({
        completedSessions: practiceAnswers.filter((answer) => answer.profileId === activeProfileId),
        skillMastery: skillMastery.filter((mastery) => mastery.profileId === activeProfileId),
        availableLessons: lessons as StructuredLesson[],
      }),
    [activeProfileId, lessons, practiceAnswers, skillMastery],
  );
  const caregiverInsights = useMemo(
    () =>
      buildCaregiverInsight({
        metrics: lessonSessionMetrics,
        recommendation: structuredRecommendation,
      }),
    [lessonSessionMetrics, structuredRecommendation],
  );
  const currentAzureVoice: PracticePreferences['azureVoice'] =
    activeRecord.preferences.voiceMode === 'male'
      ? 'vi-VN-NamMinhNeural'
      : activeRecord.preferences.azureVoice || (AZURE_SPEECH_VOICE as PracticePreferences['azureVoice']);
  const currentVoiceLabel =
    activeRecord.preferences.allowCloud && activeRecord.preferences.voiceMode !== 'system'
      ? `Azure ${AZURE_VOICE_LABELS[currentAzureVoice]}`
      : 'System TTS';

  useEffect(() => {
    return subscribeTts((state) => {
      setSpeechState({
        speaking: state.isSpeaking,
        text: state.activeText,
        voiceLabel: currentVoiceLabel,
      });
    });
  }, [currentVoiceLabel]);

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
        voiceMode: voice === 'vi-VN-NamMinhNeural' ? 'male' : 'female',
        allowCloud: true,
      },
    }));
  };

  const signInWithGoogle = async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await fetch(apiUrl('/api/auth/google/url'));
      const payload = (await response.json()) as { url?: string; message?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.message || 'Không thể bắt đầu đăng nhập Google.');
      }

      if (Platform.OS === 'web') {
        const globalScope = globalThis as typeof globalThis & {
          location?: { href?: string; assign?: (url: string) => void };
        };
        globalScope.location?.assign?.(payload.url);
        if (globalScope.location) {
          globalScope.location.href = payload.url;
        }
        return;
      }

      await Linking.openURL(payload.url);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Không thể đăng nhập Google.');
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    const token = authToken;
    setAuthToken(null);
    setAuthUser(null);
    setAuthError(null);
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);

    if (token) {
      fetch(apiUrl('/api/auth/logout'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).catch(() => undefined);
    }
  };

  const continueAsGuest = () => {
    setAuthError(null);
    setAuthLoading(false);
    setAuthToken(null);
    setAuthUser({
      id: 'guest',
      email: 'guest@local',
      name: 'Demo offline',
      guest: true,
    });
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

  const recordPracticeAnswer = (answerDraft: PracticeAnswerDraft) => {
    const profileId = answerDraft.profileId ?? activeProfileId;
    const createdAt = answerDraft.createdAt ?? new Date().toISOString();
    const answerBase = {
      ...answerDraft,
      profileId,
      createdAt,
      id:
        answerDraft.id ??
        buildPracticeAnswerId({
          profileId,
          lessonId: answerDraft.lessonId,
          taskId: answerDraft.taskId,
          attemptId: session.startedAt,
        }),
      errorTypes:
        answerDraft.errorTypes ??
        classifyError({
          taskType: answerDraft.taskType,
          selectedAnswer: answerDraft.isCorrect === true ? answerDraft.correctAnswer : answerDraft.selectedAnswer,
          correctAnswer: answerDraft.correctAnswer,
          targetPattern: answerDraft.targetPattern,
          supportUsed: answerDraft.supportUsed,
          responseTimeMs: answerDraft.responseTimeMs,
        }),
    };
    const answer: PracticeAnswer = {
      id: answerBase.id,
      profileId: answerBase.profileId,
      lessonId: answerBase.lessonId,
      taskId: answerBase.taskId,
      taskIndex: answerBase.taskIndex,
      taskType: answerBase.taskType,
      selectedAnswer: answerBase.selectedAnswer,
      correctAnswer: answerBase.correctAnswer,
      isCorrect: answerBase.isCorrect,
      responseTimeMs: answerBase.responseTimeMs,
      supportUsed: answerBase.supportUsed,
      errorTypes: answerBase.errorTypes,
      createdAt: answerBase.createdAt,
    };

    setPracticeAnswers((previous) => {
      const existingIndex = previous.findIndex((entry) => entry.id === answer.id);

      return existingIndex >= 0
        ? previous.map((entry, index) => (index === existingIndex ? answer : entry))
        : [...previous, answer];
    });
  };

  const answerQuestion = (questionId: string, answerIndex: number) => {
    const selectedLesson = lessons.find((lesson) => lesson.id === session.lessonId) ?? lessons[0];
    const questionIndex = selectedLesson.questions.findIndex((question) => question.id === questionId);
    const question = selectedLesson.questions[questionIndex];

    if (question) {
      recordPracticeAnswer({
        id: buildPracticeAnswerId({
          profileId: activeProfileId,
          lessonId: selectedLesson.id,
          taskId: question.id,
          attemptId: session.startedAt,
        }),
        profileId: activeProfileId,
        lessonId: selectedLesson.id,
        taskId: question.id,
        taskIndex: questionIndex,
        taskType: 'comprehension',
        selectedAnswer: question.options[answerIndex],
        correctAnswer: question.options[question.answerIndex],
        isCorrect: answerIndex === question.answerIndex,
      });
    }

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
    if (session.completed) {
      return;
    }

    const selectedLesson = lessons.find((lesson) => lesson.id === session.lessonId) ?? lessons[0];
    const completedAt = new Date().toISOString();
    const persistedAnswers = answersForSession(practiceAnswers, activeProfileId, selectedLesson.id, session.startedAt);
    const completedAnswers = persistedAnswers.length
      ? persistedAnswers
      : answersFromSession(selectedLesson, session, activeProfileId, completedAt);
    const metrics = calculateLessonSessionMetrics(completedAnswers);
    const accuracy = Math.max(0, Math.min(1, metrics.decodingAccuracy / 100));
    const correctAnswers = completedAnswers.filter((answer) => answer.isCorrect).length;
    const totalAnswers = Math.max(completedAnswers.length, 1);
    const reward = buildRewardMessage(accuracy, activeRecord.profile.rewardPoints);

    setSkillMastery((previous) =>
      updateSkillMastery({
        previous,
        profileId: activeProfileId,
        lesson: selectedLesson as StructuredLesson,
        metrics,
        completedAt,
      }),
    );

    updateActiveRecord((record) => {
      const existing = record.lessonProgress.find((entry) => entry.lessonId === selectedLesson.id);
      const nextProgress = existing
        ? record.lessonProgress.map((entry) =>
            entry.lessonId === selectedLesson.id
              ? {
                  ...entry,
                  attempts: entry.attempts + 1,
                  bestAccuracy: Math.max(entry.bestAccuracy, accuracy),
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
              bestAccuracy: accuracy,
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
          accuracy,
          minutes: selectedLesson.estimatedMinutes,
          flaggedWords: session.flaggedWords,
          note:
            session.caregiverNoteDraft.trim() ||
            (correctAnswers === totalAnswers
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
      lastAccuracy: accuracy,
    }));
  };

  const completeStructuredLesson = () => {
    finishSession();
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

  const deleteActiveChildData = async () => {
    const childId = activeProfileId;

    await deleteChildData(childId);
    setPracticeAnswers((previous) => previous.filter((answer) => answer.profileId !== childId));
    setSkillMastery((previous) => previous.filter((mastery) => mastery.profileId !== childId));
    setLearnerRecords((previous) =>
      previous.map((record) => (record.profile.id === childId ? resetLearnerRecordData(record) : record)),
    );
    setSession(createSession(lessons[0]?.id ?? curriculumLessons[0]?.id ?? 'tone-ngang-sac-01'));
  };

  const deleteAllAppData = async () => {
    const resetRecords = initialLearnerRecords.map(normalizeRecord);
    const firstProfileId = resetRecords[0]?.profile.id ?? initialLearnerRecords[0].profile.id;
    const firstLessonId = curriculumLessons[0]?.id ?? 'tone-ngang-sac-01';

    await deleteAllLocalData();
    setActiveProfileId(firstProfileId);
    setLearnerRecords(resetRecords);
    setLessons(curriculumLessons);
    setPracticeAnswers([]);
    setSkillMastery([]);
    setSession(createSession(firstLessonId));
    setAuthToken(null);
    setAuthUser(null);
    setAuthError(null);
    setAuthLoading(false);
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

  const speakText = (text: string, mode: 'word' | 'sentence' = 'sentence') => {
    if (!text.trim()) {
      return;
    }

    void speakWithTts({
      text,
      mode,
      rate: activeRecord.preferences.speechRate,
      voice: activeRecord.preferences.voiceMode,
      azureVoice: currentAzureVoice,
      allowCloud: activeRecord.preferences.allowCloud,
    });
  };

  const stopSpeaking = async () => {
    await stopTts();
    setSpeechState({
      speaking: false,
      text: null,
      voiceLabel: currentVoiceLabel,
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
      practiceAnswers,
      skillMastery,
      recordPracticeAnswer,
      completeStructuredLesson,
      structuredRecommendation,
      lessonSessionMetrics,
      caregiverInsights,
      authUser,
      authLoading,
      authError,
      signInWithGoogle,
      signOut,
      continueAsGuest,
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
      deleteActiveChildData,
      deleteAllAppData,
      advanceOnboarding,
      skipOnboarding,
      speakText,
      stopSpeaking,
    }),
    [
      activeProfileId,
      activeRecord,
      authError,
      authLoading,
      authUser,
      currentTheme,
      currentAzureVoice,
      caregiverInsights,
      focusWords,
      hydrated,
      learnerRecords,
      lessonSessionMetrics,
      lessons,
      practiceAnswers,
      recommendation,
      session,
      shortReport,
      speechState,
      skillMastery,
      structuredRecommendation,
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
