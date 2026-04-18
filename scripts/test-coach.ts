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
import type { SessionState } from '../src/types';

const activeRecord = initialLearnerRecords[0];
const focusWords = buildFocusWords(activeRecord.lessonProgress, activeRecord.history);

assert.equal(focusWords[0], 'nắng');
assert.ok(focusWords.includes('thuyền'));

const recommendation = getRecommendation(baseLessons, activeRecord.lessonProgress, focusWords);
assert.equal(recommendation.lessonId, 'paper-boat');

const session: SessionState = {
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

console.log('coach logic tests passed');
