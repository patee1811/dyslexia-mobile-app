export type AppTab = 'home' | 'practice' | 'caregiver' | 'hci' | 'settings';

export type LessonDifficulty = 'foundation' | 'building' | 'stretch';

export type SessionStep = 'warmup' | 'read' | 'check' | 'review';

export type ReaderFont = 'default' | 'serif' | 'mono';

export type ThemeOption = {
  id: string;
  name: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  accent: string;
  accentSoft: string;
  text: string;
  subtext: string;
  border: string;
};

export type LearnerProfile = {
  id: string;
  name: string;
  age: number;
  readingLevel: string;
  weeklyGoal: number;
  streakDays: number;
  calmMinutesTarget: number;
  supportNeeds: string[];
  strengths: string[];
  interests: string[];
  rewardPoints: number;
  latestBadge?: string;
};

export type WarmupWord = {
  word: string;
  syllables: string;
  cue: string;
  example: string;
};

export type ComprehensionQuestion = {
  id: string;
  prompt: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type Lesson = {
  id: string;
  title: string;
  difficulty: LessonDifficulty;
  topic: string;
  estimatedMinutes: number;
  focusSkill: string;
  coachGoal: string;
  warmup: WarmupWord[];
  sentences: string[];
  questions: ComprehensionQuestion[];
  caregiverTip: string;
  createdBy?: 'system' | 'caregiver';
};

export type LessonProgress = {
  lessonId: string;
  attempts: number;
  bestAccuracy: number;
  lastCompletedAt?: string;
  flaggedWords: string[];
};

export type PracticePreferences = {
  fontScale: number;
  lineSpacing: number;
  chunkSize: number;
  focusMode: boolean;
  superFocus: boolean;
  showSyllables: boolean;
  themeId: string;
  readerFont: ReaderFont;
  letterSpacing: number;
  azureVoice: 'vi-VN-HoaiMyNeural' | 'vi-VN-NamMinhNeural';
};

export type SessionState = {
  lessonId: string;
  step: SessionStep;
  sentenceIndex: number;
  openWarmupWords: string[];
  flaggedWords: string[];
  answers: Record<string, number>;
  completed: boolean;
  lastAccuracy?: number;
  caregiverNoteDraft: string;
  fluencyRating: number;
};

export type SessionHistoryEntry = {
  id: string;
  profileId: string;
  lessonId: string;
  lessonTitle: string;
  date: string;
  accuracy: number;
  minutes: number;
  flaggedWords: string[];
  note: string;
  fluencyRating: number;
};

export type StatCard = {
  label: string;
  value: string;
  note: string;
};

export type Recommendation = {
  lessonId: string;
  title: string;
  reason: string;
};

export type HciChecklistGroup = {
  title: string;
  items: string[];
};

export type CaregiverNote = {
  id: string;
  profileId: string;
  lessonId?: string;
  createdAt: string;
  text: string;
};

export type OnboardingState = {
  step: number;
  completed: boolean;
};

export type LearnerRecord = {
  profile: LearnerProfile;
  preferences: PracticePreferences;
  lessonProgress: LessonProgress[];
  history: SessionHistoryEntry[];
  notes: CaregiverNote[];
  onboarding: OnboardingState;
};

export type LessonDraft = {
  title: string;
  topic: string;
  focusSkill: string;
  sentencesText: string;
  caregiverTip: string;
};

export type SpeechState = {
  speaking: boolean;
  text: string | null;
  voiceLabel?: string;
};
