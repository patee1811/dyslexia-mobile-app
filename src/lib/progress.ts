import type {
  LessonSessionMetrics,
  PracticeAnswer,
  ReadingErrorType,
} from '../types/progress';

export const readingErrorTypes: ReadingErrorType[] = [
  'tone_error',
  'onset_confusion',
  'rime_confusion',
  'omission',
  'substitution',
  'slow_decoding',
  'needs_audio_prompt',
  'comprehension_error',
];

const AUDIO_SUPPORT_MARKERS = ['audio', 'listen', 'replay', 'sample', 'tts'];

function normalizeText(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

function normalizeTaskType(taskType: string) {
  return taskType.trim().toLowerCase();
}

function targetPatternHas(targetPattern: unknown, markers: string[]) {
  if (!targetPattern || typeof targetPattern !== 'object') {
    return false;
  }

  return Object.entries(targetPattern as Record<string, unknown>).some(([key, value]) => {
    const normalizedKey = key.toLowerCase();
    const normalizedValue = typeof value === 'string' ? value.toLowerCase() : '';

    return markers.some((marker) => normalizedKey.includes(marker) || normalizedValue.includes(marker));
  });
}

function supportLooksAudioRelated(support: string) {
  const normalized = support.toLowerCase();
  return AUDIO_SUPPORT_MARKERS.some((marker) => normalized.includes(marker));
}

function hasAudioSupportPrompt(supportUsed?: string[]) {
  return Boolean(supportUsed?.some(supportLooksAudioRelated) || (supportUsed && supportUsed.length > 1));
}

function isSentenceLikeTask(taskType: string) {
  const normalized = normalizeTaskType(taskType);
  return normalized.includes('sentence') || normalized.includes('comprehension') || normalized.includes('fluency');
}

function isSlowResponse(taskType: string, responseTimeMs?: number) {
  if (typeof responseTimeMs !== 'number') {
    return false;
  }

  return responseTimeMs > (isSentenceLikeTask(taskType) ? 12000 : 8000);
}

function isIncorrect(selectedAnswer?: string, correctAnswer?: string) {
  if (correctAnswer === undefined) {
    return false;
  }

  return normalizeText(selectedAnswer) !== normalizeText(correctAnswer);
}

export function classifyError(input: {
  taskType: string;
  selectedAnswer?: string;
  correctAnswer?: string;
  targetPattern?: unknown;
  supportUsed?: string[];
  responseTimeMs?: number;
}): ReadingErrorType[] {
  const taskType = normalizeTaskType(input.taskType);
  const incorrect = isIncorrect(input.selectedAnswer, input.correctAnswer);
  const errors = new Set<ReadingErrorType>();

  if (incorrect) {
    if (taskType.includes('tone') || taskType.includes('tone_minimal_pair')) {
      errors.add('tone_error');
    }

    if (taskType.includes('onset') || targetPatternHas(input.targetPattern, ['onset'])) {
      errors.add('onset_confusion');
    }

    if (taskType.includes('rime') || targetPatternHas(input.targetPattern, ['rime'])) {
      errors.add('rime_confusion');
    }

    if (taskType.includes('comprehension') || taskType.includes('meaning') || taskType.includes('story_retell')) {
      errors.add('comprehension_error');
    }

    if (normalizeText(input.selectedAnswer) === '' && input.correctAnswer !== undefined) {
      errors.add('omission');
    } else if (input.correctAnswer !== undefined) {
      errors.add('substitution');
    }
  }

  if (hasAudioSupportPrompt(input.supportUsed)) {
    errors.add('needs_audio_prompt');
  }

  if (isSlowResponse(input.taskType, input.responseTimeMs)) {
    errors.add('slow_decoding');
  }

  return [...errors];
}

function createEmptyErrorSummary(): Record<ReadingErrorType, number> {
  return readingErrorTypes.reduce(
    (summary, errorType) => ({
      ...summary,
      [errorType]: 0,
    }),
    {} as Record<ReadingErrorType, number>,
  );
}

function percentage(correct: number, total: number) {
  if (total === 0) {
    return 100;
  }

  return Math.round((correct / total) * 100);
}

function hasError(answer: PracticeAnswer, errorType: ReadingErrorType) {
  return answer.errorTypes.includes(errorType);
}

function isTaskCategory(answer: PracticeAnswer, markers: string[]) {
  const taskType = normalizeTaskType(answer.taskType);
  return markers.some((marker) => taskType.includes(marker));
}

function categoryAccuracy(
  answers: PracticeAnswer[],
  predicate: (answer: PracticeAnswer) => boolean,
  success: (answer: PracticeAnswer) => boolean = (answer) => answer.isCorrect,
) {
  const matchingAnswers = answers.filter(predicate);
  return percentage(matchingAnswers.filter(success).length, matchingAnswers.length);
}

export function calculateLessonSessionMetrics(
  answers: PracticeAnswer[],
): LessonSessionMetrics {
  const errorSummary = createEmptyErrorSummary();
  let audioReplayCount = 0;
  const timedAnswers = answers.filter((answer) => typeof answer.responseTimeMs === 'number');

  answers.forEach((answer) => {
    answer.errorTypes.forEach((errorType) => {
      errorSummary[errorType] += 1;
    });

    audioReplayCount += answer.supportUsed?.filter(supportLooksAudioRelated).length ?? 0;
  });

  return {
    decodingAccuracy: categoryAccuracy(answers, () => true),
    toneAccuracy: categoryAccuracy(
      answers,
      (answer) => isTaskCategory(answer, ['tone']) || hasError(answer, 'tone_error'),
    ),
    onsetAccuracy: categoryAccuracy(
      answers,
      (answer) => isTaskCategory(answer, ['onset']) || hasError(answer, 'onset_confusion'),
    ),
    rimeAccuracy: categoryAccuracy(
      answers,
      (answer) => isTaskCategory(answer, ['rime']) || hasError(answer, 'rime_confusion'),
    ),
    wordReadingAccuracy: categoryAccuracy(
      answers,
      (answer) =>
        isTaskCategory(answer, ['word', 'decode', 'reading', 'dictation', 'spelling']) ||
        hasError(answer, 'omission') ||
        hasError(answer, 'substitution'),
    ),
    sentenceFluency: categoryAccuracy(
      answers,
      (answer) =>
        isTaskCategory(answer, ['sentence', 'fluency']) ||
        hasError(answer, 'slow_decoding') ||
        hasError(answer, 'needs_audio_prompt'),
      (answer) => answer.isCorrect && !hasError(answer, 'slow_decoding'),
    ),
    comprehensionAccuracy: categoryAccuracy(
      answers,
      (answer) => isTaskCategory(answer, ['comprehension', 'meaning', 'story_retell']) || hasError(answer, 'comprehension_error'),
    ),
    audioReplayCount,
    averageResponseTimeMs:
      timedAnswers.length === 0
        ? 0
        : Math.round(
            timedAnswers.reduce((sum, answer) => sum + (answer.responseTimeMs ?? 0), 0) / timedAnswers.length,
          ),
    errorSummary,
  };
}
