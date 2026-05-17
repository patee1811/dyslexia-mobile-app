import type { PracticeAnswer, ReadingErrorType } from '../types/progress';
import type { LiteracySkill, SkillMastery, StructuredLesson } from './mastery';

export type StructuredLessonRecommendation = {
  lessonId: string;
  title: string;
  reason: string;
  focusSkill: LiteracySkill;
  priority: 'review' | 'continue' | 'advance';
};

function normalizeSkill(value?: string): LiteracySkill | undefined {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return undefined;
  }

  if (normalized.includes('tone') || normalized.includes('thanh') || normalized.includes('dau')) {
    return 'tone';
  }

  if (normalized.includes('onset') || normalized.includes('am dau') || normalized.includes('âm đầu')) {
    return 'onset';
  }

  if (normalized.includes('rime') || normalized.includes('van') || normalized.includes('vần')) {
    return 'rime';
  }

  if (normalized.includes('comprehension') || normalized.includes('hieu') || normalized.includes('hiểu')) {
    return 'comprehension';
  }

  if (normalized.includes('sentence') || normalized.includes('fluency') || normalized.includes('cau')) {
    return 'sentence';
  }

  if (normalized.includes('word') || normalized.includes('tu')) {
    return 'word';
  }

  return normalized;
}

function lessonSkills(lesson: StructuredLesson): LiteracySkill[] {
  if (lesson.targetSkills?.length) {
    return [...new Set(lesson.targetSkills.map((skill) => normalizeSkill(skill) ?? skill))];
  }

  return [
    normalizeSkill(lesson.focusSkill) ??
      normalizeSkill(lesson.targetPattern?.skill) ??
      normalizeSkill(lesson.targetPattern?.type) ??
      'word',
  ];
}

function lessonPatternKey(lesson: StructuredLesson) {
  return lesson.targetPattern?.key ?? lesson.targetPattern?.patternKey ?? lesson.targetPattern?.value ?? lesson.id;
}

function errorToSkill(errorType: ReadingErrorType): LiteracySkill {
  switch (errorType) {
    case 'tone_error':
      return 'tone';
    case 'onset_confusion':
      return 'onset';
    case 'rime_confusion':
      return 'rime';
    case 'comprehension_error':
      return 'comprehension';
    case 'slow_decoding':
    case 'needs_audio_prompt':
      return 'sentence';
    case 'omission':
    case 'substitution':
      return 'word';
    default:
      return 'word';
  }
}

function referenceDate(completedSessions: PracticeAnswer[], skillMastery: SkillMastery[]) {
  const timestamps = [
    ...completedSessions.map((answer) => answer.createdAt),
    ...skillMastery.map((mastery) => mastery.lastPracticedAt),
  ]
    .map((value) => new Date(value).getTime())
    .filter(Number.isFinite);

  return timestamps.length === 0 ? 0 : Math.max(...timestamps);
}

function prerequisitesAreReady(lesson: StructuredLesson, skillMastery: SkillMastery[]) {
  if (!lesson.prerequisites?.length) {
    return true;
  }

  return lesson.prerequisites.every((prerequisite) =>
    skillMastery.some(
      (mastery) =>
        mastery.mastered && (mastery.patternKey === prerequisite || normalizeSkill(mastery.skill) === normalizeSkill(prerequisite)),
    ),
  );
}

function findMatchingLesson(
  lessons: StructuredLesson[],
  skillMastery: SkillMastery[],
  skill?: LiteracySkill,
  patternKey?: string,
) {
  const readyLessons = lessons.filter((lesson) => prerequisitesAreReady(lesson, skillMastery));
  const candidates = readyLessons.length ? readyLessons : lessons;

  return (
    candidates.find((lesson) => patternKey && lessonPatternKey(lesson) === patternKey) ??
    candidates.find((lesson) => skill && lessonSkills(lesson).some((lessonSkill) => normalizeSkill(lessonSkill) === normalizeSkill(skill))) ??
    candidates[0]
  );
}

function buildRecommendation(
  lesson: StructuredLesson,
  focusSkill: LiteracySkill,
  priority: StructuredLessonRecommendation['priority'],
  reason: string,
): StructuredLessonRecommendation {
  return {
    lessonId: lesson.id,
    title: lesson.title,
    reason,
    focusSkill,
    priority,
  };
}

function dominantRecentError(completedSessions: PracticeAnswer[]) {
  const counts = new Map<ReadingErrorType, number>();
  const recentAnswers = [...completedSessions]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 20);

  recentAnswers.forEach((answer) => {
    answer.errorTypes.forEach((errorType) => counts.set(errorType, (counts.get(errorType) ?? 0) + 1));
  });

  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0];
}

export function getNextLessonRecommendation(input: {
  completedSessions: PracticeAnswer[];
  skillMastery: SkillMastery[];
  availableLessons: StructuredLesson[];
}): StructuredLessonRecommendation {
  const lessons = [...input.availableLessons].sort((left, right) => {
    const leftOrder = left.order ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.order ?? Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder || left.id.localeCompare(right.id);
  });

  if (lessons.length === 0) {
    return {
      lessonId: 'no-lesson-available',
      title: 'Chua co bai luyen',
      reason: 'Chua co bai luyen kha dung nen app tam thoi chua the goi y bai tiep theo.',
      focusSkill: 'word',
      priority: 'continue',
    };
  }

  const now = referenceDate(input.completedSessions, input.skillMastery);
  const dueMastery = input.skillMastery
    .filter((mastery) => !mastery.mastered && new Date(mastery.nextReviewAt).getTime() <= now)
    .sort(
      (left, right) =>
        left.recentAccuracy - right.recentAccuracy ||
        new Date(left.nextReviewAt).getTime() - new Date(right.nextReviewAt).getTime() ||
        left.skill.localeCompare(right.skill),
    )[0];

  if (dueMastery) {
    const lesson = findMatchingLesson(lessons, input.skillMastery, dueMastery.skill, dueMastery.patternKey);
    return buildRecommendation(
      lesson,
      dueMastery.skill,
      'review',
      `Con can on lai ky nang ${dueMastery.skill} vi lan gan day dat ${Math.round(
        dueMastery.recentAccuracy,
      )}% va lich on tap da den han.`,
    );
  }

  const dominantError = dominantRecentError(input.completedSessions);

  if (dominantError) {
    const [errorType, count] = dominantError;
    const skill = errorToSkill(errorType);
    const lesson = findMatchingLesson(lessons, input.skillMastery, skill);

    return buildRecommendation(
      lesson,
      skill,
      'review',
      `Con can luyen them ${skill} vi ${errorType} xuat hien ${count} lan trong cac cau tra loi gan day.`,
    );
  }

  const masteredCount = input.skillMastery.filter((mastery) => mastery.mastered || mastery.recentAccuracy >= 90).length;
  const strongRecentMastery = input.skillMastery.length > 0 && masteredCount / input.skillMastery.length >= 0.6;

  if (strongRecentMastery) {
    const lesson =
      lessons.find(
        (candidate) =>
          prerequisitesAreReady(candidate, input.skillMastery) &&
          !input.skillMastery.some(
            (mastery) => mastery.mastered && mastery.patternKey === lessonPatternKey(candidate),
          ),
      ) ?? lessons[0];
    const focusSkill = lessonSkills(lesson)[0] ?? 'word';

    return buildRecommendation(
      lesson,
      focusSkill,
      'advance',
      'Ket qua gan day on dinh nen app goi y chuyen sang bai phu hop tiep theo.',
    );
  }

  if (input.completedSessions.length === 0 && input.skillMastery.length === 0) {
    const lesson = lessons.find((candidate) => candidate.difficulty === 'foundation') ?? lessons[0];
    return buildRecommendation(
      lesson,
      lessonSkills(lesson)[0] ?? 'word',
      'continue',
      'Chua co du lieu luyen tap nen app bat dau tu bai nen tang dau tien.',
    );
  }

  const weakestMastery = [...input.skillMastery]
    .filter((mastery) => !mastery.mastered)
    .sort((left, right) => left.recentAccuracy - right.recentAccuracy || left.skill.localeCompare(right.skill))[0];
  const lesson = findMatchingLesson(lessons, input.skillMastery, weakestMastery?.skill, weakestMastery?.patternKey);

  return buildRecommendation(
    lesson,
    weakestMastery?.skill ?? lessonSkills(lesson)[0] ?? 'word',
    'continue',
    weakestMastery
      ? `App tiep tuc goi y bai nay vi ky nang ${weakestMastery.skill} hien dat ${Math.round(
          weakestMastery.recentAccuracy,
        )}%.`
      : 'App tiep tuc goi y bai phu hop voi lo trinh hien tai.',
  );
}
