export type ReadingErrorType =
  | 'tone_error'
  | 'onset_confusion'
  | 'rime_confusion'
  | 'omission'
  | 'substitution'
  | 'slow_decoding'
  | 'needs_audio_prompt'
  | 'comprehension_error';

export type PracticeAnswer = {
  id: string;
  profileId: string;
  lessonId: string;
  taskId: string;
  taskIndex: number;
  taskType: string;
  selectedAnswer?: string;
  correctAnswer?: string;
  isCorrect: boolean;
  responseTimeMs?: number;
  supportUsed?: string[];
  errorTypes: ReadingErrorType[];
  createdAt: string;
};

export type LessonSessionMetrics = {
  decodingAccuracy: number;
  toneAccuracy: number;
  onsetAccuracy: number;
  rimeAccuracy: number;
  wordReadingAccuracy: number;
  sentenceFluency: number;
  comprehensionAccuracy: number;
  audioReplayCount: number;
  averageResponseTimeMs: number;
  errorSummary: Record<ReadingErrorType, number>;
};

export type PracticeAnswerDraft = Omit<
  PracticeAnswer,
  'id' | 'profileId' | 'createdAt' | 'errorTypes'
> & {
  id?: string;
  profileId?: string;
  createdAt?: string;
  errorTypes?: ReadingErrorType[];
  targetPattern?: unknown;
};
