import type {
  Lesson,
  LessonProgress,
  LearnerProfile,
  Recommendation,
  SessionHistoryEntry,
  SessionState,
  StatCard,
} from '../types';
import type { LessonSessionMetrics, ReadingErrorType } from '../types/progress';
import type { StructuredLessonRecommendation } from './adaptive';

const ERROR_INSIGHT_LABELS: Record<ReadingErrorType, string> = {
  tone_error: 'dau thanh',
  onset_confusion: 'am dau',
  rime_confusion: 'van',
  omission: 'bo sot tu hoac dap an',
  substitution: 'chon nham dap an',
  slow_decoding: 'toc do giai ma',
  needs_audio_prompt: 'su dung ho tro am thanh',
  comprehension_error: 'doc hieu',
};

export function buildCaregiverInsight(input: {
  metrics: LessonSessionMetrics;
  recommendation: StructuredLessonRecommendation;
}): string[] {
  const insights: string[] = [];
  const repeatedErrors = Object.entries(input.metrics.errorSummary)
    .filter(([, count]) => count >= 1)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 2) as [ReadingErrorType, number][];

  repeatedErrors.forEach(([errorType, count]) => {
    insights.push(
      `Con dang can luyen them ${ERROR_INSIGHT_LABELS[errorType]} vi dang co ${count} loi trong buoi gan day.`,
    );
  });

  if (input.metrics.averageResponseTimeMs > 8000) {
    insights.push('Thoi gian phan hoi trung binh con hoi dai, nen cho con luyen tung cau ngan truoc.');
  }

  if (input.metrics.audioReplayCount > 0) {
    insights.push(
      `Con da dung ho tro am thanh ${input.metrics.audioReplayCount} lan, co the cho con nghe mau roi doc lai cham.`,
    );
  }

  insights.push(`App goi y bai "${input.recommendation.title}" vi ${input.recommendation.reason}`);

  if (insights.length < 3) {
    insights.unshift(
      `Ket qua luyen tap gan day dat ${Math.round(input.metrics.decodingAccuracy)}% do chinh xac tong quat.`,
    );
  }

  return insights.slice(0, 5);
}

export function buildFocusWords(progress: LessonProgress[], history: SessionHistoryEntry[]) {
  const counts = new Map<string, number>();

  progress.forEach((entry) => {
    entry.flaggedWords.forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 2));
  });

  history.forEach((entry) => {
    entry.flaggedWords.forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 1));
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([word]) => word);
}

export function getRecommendation(lessons: Lesson[], progress: LessonProgress[], focusWords: string[]): Recommendation {
  const sortedLessons = [...lessons].sort((left, right) => {
    const leftProgress = progress.find((entry) => entry.lessonId === left.id);
    const rightProgress = progress.find((entry) => entry.lessonId === right.id);

    return (leftProgress?.bestAccuracy ?? 0) - (rightProgress?.bestAccuracy ?? 0);
  });

  const byFlaggedWord = sortedLessons.find((lesson) => lesson.warmup.some((item) => focusWords.includes(item.word)));

  if (byFlaggedWord) {
    const matchedWords = byFlaggedWord.warmup
      .filter((item) => focusWords.includes(item.word))
      .map((item) => item.word)
      .join(', ');

    return {
      lessonId: byFlaggedWord.id,
      title: byFlaggedWord.title,
      reason: `Bài này ôn lại các từ ${matchedWords} đang cần củng cố.`,
    };
  }

  const fallback = sortedLessons[0];

  return {
    lessonId: fallback.id,
    title: fallback.title,
    reason: 'Đây là bài có độ chính xác còn thấp nhất nên nên được ưu tiên trong hôm nay.',
  };
}

export function buildWeeklyStats(
  history: SessionHistoryEntry[],
  progress: LessonProgress[],
  weeklyGoal: number,
): StatCard[] {
  const sessionsThisWeek = history.slice(0, 7).length;
  const averageAccuracy =
    history.length === 0 ? 0 : history.reduce((sum, entry) => sum + entry.accuracy, 0) / history.length;
  const averageFluency =
    history.length === 0 ? 0 : history.reduce((sum, entry) => sum + entry.fluencyRating, 0) / history.length;
  const minutes = history.reduce((sum, entry) => sum + entry.minutes, 0);
  const flaggedWords = buildFocusWords(progress, history);

  return [
    {
      label: 'Buổi luyện tuần này',
      value: `${sessionsThisWeek}/${weeklyGoal}`,
      note: sessionsThisWeek >= weeklyGoal ? 'Đã đạt mục tiêu tuần.' : 'Còn thiếu vài buổi ngắn để đủ mục tiêu.',
    },
    {
      label: 'Độ chính xác trung bình',
      value: `${Math.round(averageAccuracy * 100)}%`,
      note: 'Tính từ lịch sử buổi học gần nhất.',
    },
    {
      label: 'Độ lưu loát',
      value: `${averageFluency.toFixed(1)}/5`,
      note: 'Đánh giá đơn giản để so sánh giữa các buổi học.',
    },
    {
      label: 'Từ cần ôn',
      value: flaggedWords.length === 0 ? '0 từ' : `${flaggedWords.length} từ`,
      note: flaggedWords.length === 0 ? 'Chưa có từ cần ưu tiên.' : flaggedWords.join(', '),
    },
    {
      label: 'Tổng phút luyện',
      value: `${minutes} phút`,
      note: 'Các buổi ngắn và đều giúp trẻ bớt áp lực.',
    },
  ];
}

export function scoreSession(lesson: Lesson, session: SessionState) {
  const questionCount = lesson.questions.length || 1;
  const correctAnswers = lesson.questions.reduce((count, question) => {
    return count + (session.answers[question.id] === question.answerIndex ? 1 : 0);
  }, 0);
  const questionScore = correctAnswers / questionCount;
  const fluencyBoost = Math.min(session.fluencyRating * 0.015, 0.06);
  const penalty = Math.min(session.flaggedWords.length * 0.05, 0.22);
  const accuracy = Math.max(0.52, Math.min(0.98, 0.74 + questionScore * 0.18 + fluencyBoost - penalty));

  return {
    accuracy,
    correctAnswers,
    totalQuestions: questionCount,
  };
}

export function mergeFlaggedWords(existing: string[], incoming: string[]) {
  return [...new Set([...existing, ...incoming])];
}

export function formatSessionDate(dateIso: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateIso));
}

export function buildShortReport(
  profile: LearnerProfile,
  history: SessionHistoryEntry[],
  focusWords: string[],
  recommendation: Recommendation,
) {
  const latest = history[0];
  const averageAccuracy =
    history.length === 0 ? 0 : history.reduce((sum, entry) => sum + entry.accuracy, 0) / history.length;

  return [
    `Báo cáo nhanh cho ${profile.name}`,
    `Mức đọc hiện tại: ${profile.readingLevel}`,
    `Độ chính xác trung bình: ${Math.round(averageAccuracy * 100)}%`,
    latest ? `Buổi gần nhất: ${latest.lessonTitle} - ${Math.round(latest.accuracy * 100)}%` : 'Chưa có buổi học nào.',
    focusWords.length ? `Từ cần ôn: ${focusWords.join(', ')}` : 'Chưa có từ cần ôn nổi bật.',
    `Khuyến nghị tiếp theo: ${recommendation.title}`,
  ].join('\n');
}

export function buildRewardMessage(accuracy: number, previousPoints: number) {
  const bonus = accuracy >= 0.9 ? 4 : accuracy >= 0.8 ? 3 : 2;
  const total = previousPoints + bonus;
  const badge = accuracy >= 0.9 ? 'Ngôi sao tự tin' : accuracy >= 0.8 ? 'Bình tĩnh đọc chậm' : 'Cố gắng đều đặn';

  return {
    bonus,
    total,
    badge,
    message: `Con nhận thêm ${bonus} điểm thưởng vì đã hoàn thành buổi luyện.`,
  };
}
