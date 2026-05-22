import assert from 'node:assert/strict';
import { initialLearnerRecords, baseLessons } from '../src/data/content';
import {
  buildFocusWords,
  buildRewardMessage,
  buildShortReport,
  buildWeeklyStats,
  getRecommendation,
  scoreSession,
} from '../src/lib/coach';
import { getNextLessonRecommendation } from '../src/lib/adaptive';
import { updateSkillMastery, type SkillMastery, type StructuredLesson } from '../src/lib/mastery';
import { calculateLessonSessionMetrics, classifyError, readingErrorTypes } from '../src/lib/progress';
import type { LessonSessionMetrics, PracticeAnswer } from '../src/types/progress';
import type { SessionState } from '../src/types';

const activeRecord = initialLearnerRecords[0];
const focusWords = buildFocusWords(activeRecord.lessonProgress, activeRecord.history);

assert.equal(focusWords[0], 'nắng');
assert.ok(focusWords.includes('thuyền'));

const recommendation = getRecommendation(baseLessons, activeRecord.lessonProgress, focusWords);
assert.equal(recommendation.lessonId, 'paper-boat');

const session: SessionState = {
  startedAt: '2026-01-01T00:00:00.000Z',
  lessonId: 'garden-morning',
  step: 'review',
  sentenceIndex: 3,
  openWarmupWords: [],
  flaggedWords: ['nắng'],
  answers: {
    'garden-q1': 1,
    'garden-q2': 2,
  },
  completed: false,
  caregiverNoteDraft: 'Con chủ động nghe lại từ khó.',
  fluencyRating: 4,
};

const result = scoreSession(baseLessons[0], session);
assert.ok(result.accuracy > 0.85);
assert.equal(result.correctAnswers, 2);

const weeklyStats = buildWeeklyStats(activeRecord.history, activeRecord.lessonProgress, activeRecord.profile.weeklyGoal);
assert.ok(weeklyStats.some((item) => item.label === 'Độ lưu loát'));

const reward = buildRewardMessage(0.91, activeRecord.profile.rewardPoints);
assert.equal(reward.badge, 'Ngôi sao tự tin');
assert.equal(reward.total, activeRecord.profile.rewardPoints + 4);

const report = buildShortReport(activeRecord.profile, activeRecord.history, focusWords, recommendation);
assert.match(report, /Báo cáo nhanh cho Bé An/);
assert.match(report, /Khuyến nghị tiếp theo/);

const toneErrors = classifyError({
  taskType: 'tone_minimal_pair',
  selectedAnswer: 'ma',
  correctAnswer: 'má',
});
assert.ok(toneErrors.includes('tone_error'));

const comprehensionErrors = classifyError({
  taskType: 'comprehension_check',
  selectedAnswer: 'A',
  correctAnswer: 'B',
});
assert.ok(comprehensionErrors.includes('comprehension_error'));

const practiceAnswers: PracticeAnswer[] = [
  {
    id: 'answer-1',
    profileId: 'an',
    lessonId: 'tone-lesson',
    taskId: 'tone-1',
    taskIndex: 0,
    taskType: 'tone_minimal_pair',
    selectedAnswer: 'ma',
    correctAnswer: 'má',
    isCorrect: false,
    responseTimeMs: 9000,
    supportUsed: ['audio'],
    errorTypes: toneErrors,
    createdAt: '2026-05-17T09:00:00.000Z',
  },
  {
    id: 'answer-2',
    profileId: 'an',
    lessonId: 'tone-lesson',
    taskId: 'comp-1',
    taskIndex: 1,
    taskType: 'comprehension',
    selectedAnswer: 'A',
    correctAnswer: 'B',
    isCorrect: false,
    errorTypes: comprehensionErrors,
    createdAt: '2026-05-17T09:01:00.000Z',
  },
];

const metrics = calculateLessonSessionMetrics(practiceAnswers);
readingErrorTypes.forEach((errorType) => {
  assert.equal(typeof metrics.errorSummary[errorType], 'number');
});
Object.entries(metrics).forEach(([key, value]) => {
  if (typeof value === 'number') {
    assert.equal(Number.isNaN(value), false, `${key} should not be NaN`);
  }
});

const structuredLessons: StructuredLesson[] = [
  {
    ...baseLessons[0],
    id: 'tone-review',
    title: 'Tone Review',
    targetSkills: ['tone'],
    targetPattern: { key: 'tone-basic', skill: 'tone' },
    difficulty: 'foundation',
  },
  {
    ...baseLessons[1],
    id: 'word-next',
    title: 'Word Next',
    targetSkills: ['word'],
    targetPattern: { key: 'word-basic', skill: 'word' },
  },
];

const lowMastery: SkillMastery[] = [
  {
    profileId: 'an',
    skill: 'tone',
    patternKey: 'tone-basic',
    attempts: 1,
    recentAccuracy: 55,
    mastered: false,
    lastPracticedAt: '2026-05-17T09:00:00.000Z',
    nextReviewAt: '2026-05-17T09:00:00.000Z',
    highAccuracyStreak: 0,
  },
];

const adaptiveRecommendation = getNextLessonRecommendation({
  completedSessions: practiceAnswers,
  skillMastery: lowMastery,
  availableLessons: structuredLessons,
});
assert.equal(adaptiveRecommendation.priority, 'review');
assert.equal(adaptiveRecommendation.lessonId, 'tone-review');

const highMetrics: LessonSessionMetrics = {
  ...calculateLessonSessionMetrics([]),
  decodingAccuracy: 95,
  toneAccuracy: 95,
};
const masteryAfterOne = updateSkillMastery({
  previous: [],
  profileId: 'an',
  lesson: structuredLessons[0],
  metrics: highMetrics,
  completedAt: '2026-05-17T09:00:00.000Z',
});
const masteryAfterTwo = updateSkillMastery({
  previous: masteryAfterOne,
  profileId: 'an',
  lesson: structuredLessons[0],
  metrics: highMetrics,
  completedAt: '2026-05-18T09:00:00.000Z',
});
const masteryAfterThree = updateSkillMastery({
  previous: masteryAfterTwo,
  profileId: 'an',
  lesson: structuredLessons[0],
  metrics: highMetrics,
  completedAt: '2026-05-19T09:00:00.000Z',
});
assert.equal(masteryAfterThree[0].mastered, true);
assert.equal(masteryAfterThree[0].highAccuracyStreak, 3);

console.log('coach and adaptive logic tests passed');
