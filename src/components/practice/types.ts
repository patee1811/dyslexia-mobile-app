import type { PracticePreferences, SpeechState, WarmupWord } from '../../types';

export type PracticeAnswerDraft = {
  taskId: string;
  selectedAnswer?: string;
  isCorrect?: boolean;
  supportUsed?: string[];
  responseTimeMs?: number;
};

export type PracticeTaskKind =
  | 'listen_choose'
  | 'sound_to_letter'
  | 'blend_syllable'
  | 'tone_minimal_pair'
  | 'read_word'
  | 'read_sentence'
  | 'comprehension'
  | 'dictation_spelling'
  | 'match_word_meaning'
  | 'story_retell'
  | 'personalized_review'
  | 'review';

export type BlendParts = {
  initial: string;
  rime: string;
  tone: string;
  result: string;
};

export type ChoiceDetail = {
  value: string;
  label?: string;
};

export type ReaderPreferences = Pick<
  PracticePreferences,
  'fontScale' | 'lineSpacing' | 'letterSpacing' | 'readerFont' | 'focusMode' | 'superFocus' | 'showSyllables'
>;

export type LessonTask = {
  id: string;
  kind: PracticeTaskKind;
  title: string;
  instruction: string;
  targetText?: string;
  audioText?: string;
  choices?: string[];
  correctAnswer?: string;
  parts?: BlendParts;
  choiceDetails?: ChoiceDetail[];
  prompt?: string;
  audioPrompt?: string;
  imageLabel?: string;
  story?: string;
  minWords?: number;
  options?: string[];
  answerIndex?: number;
  explanation?: string;
  questionId?: string;
  sentence?: string;
  sentenceIndex?: number;
  totalSentences?: number;
  readerPreferences?: ReaderPreferences;
  warmupWords?: WarmupWord[];
  flaggedWords?: string[];
  reviewWords?: string[];
  nextSuggestion?: string;
  completed?: boolean;
};

export type PracticeStepProps = {
  task: LessonTask;
  taskIndex: number;
  totalTasks: number;
  onAnswer: (answer: PracticeAnswerDraft) => void;
  onNext: () => void;
  onReplayAudio?: (text: string) => void;
  speechState?: SpeechState;
};
