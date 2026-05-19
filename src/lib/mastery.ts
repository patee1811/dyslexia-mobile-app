import type { Lesson } from '../types';
import type { LessonSessionMetrics } from '../types/progress';

export type LiteracySkill =
  | 'tone'
  | 'onset'
  | 'rime'
  | 'word'
  | 'sentence'
  | 'comprehension'
  | string;

export type SkillMastery = {
  profileId: string;
  skill: LiteracySkill;
  patternKey: string;
  attempts: number;
  recentAccuracy: number;
  mastered: boolean;
  lastPracticedAt: string;
  nextReviewAt: string;
  highAccuracyStreak?: number;
};

export type StructuredLesson = Lesson & {
  targetSkills?: LiteracySkill[];
  targetPattern?: {
    key?: string;
    patternKey?: string;
    skill?: LiteracySkill;
    type?: string;
    value?: string;
  };
  mastery?: unknown;
  prerequisiteLessonIds?: string[];
  prerequisites?: string[];
  order?: number;
};

function addDays(dateIso: string, days: number) {
  const date = new Date(dateIso);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function normalizeSkill(value?: string): LiteracySkill | undefined {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) {
    return undefined;
  }

  if (normalized.includes('tone') || normalized.includes('thanh') || normalized.includes('dau')) {
    return 'tone';
  }

  if (
    normalized.includes('onset') ||
    normalized.includes('sound_symbol') ||
    normalized.includes('am dau') ||
    normalized.includes('âm đầu')
  ) {
    return 'onset';
  }

  if (
    normalized.includes('rime') ||
    normalized.includes('syllable_blending') ||
    normalized.includes('van') ||
    normalized.includes('vần')
  ) {
    return 'rime';
  }

  if (normalized.includes('sentence') || normalized.includes('fluency') || normalized.includes('cau')) {
    return 'sentence';
  }

  if (normalized.includes('comprehension') || normalized.includes('hieu') || normalized.includes('hiểu')) {
    return 'comprehension';
  }

  if (normalized.includes('word') || normalized.includes('spelling') || normalized.includes('chinh ta') || normalized.includes('tu')) {
    return 'word';
  }

  return normalized;
}

function inferTargetSkills(lesson: StructuredLesson): LiteracySkill[] {
  if (lesson.targetSkills?.length) {
    return [...new Set(lesson.targetSkills.map((skill) => normalizeSkill(skill) ?? skill))];
  }

  const inferred =
    normalizeSkill(lesson.focusSkill) ??
    normalizeSkill(lesson.targetPattern?.skill) ??
    normalizeSkill(lesson.targetPattern?.type) ??
    'word';

  return [inferred];
}

function inferPatternKey(lesson: StructuredLesson) {
  return (
    lesson.targetPattern?.key ??
    lesson.targetPattern?.patternKey ??
    lesson.targetPattern?.value ??
    lesson.id ??
    lesson.focusSkill ??
    'general'
  );
}

function metricForSkill(skill: LiteracySkill, metrics: LessonSessionMetrics) {
  switch (normalizeSkill(skill)) {
    case 'tone':
      return metrics.toneAccuracy;
    case 'onset':
      return metrics.onsetAccuracy;
    case 'rime':
      return metrics.rimeAccuracy;
    case 'word':
      return metrics.wordReadingAccuracy;
    case 'sentence':
      return metrics.sentenceFluency;
    case 'comprehension':
      return metrics.comprehensionAccuracy;
    default:
      return metrics.decodingAccuracy;
  }
}

function nextReviewDate(completedAt: string, recentAccuracy: number, mastered: boolean) {
  if (recentAccuracy < 80) {
    return addDays(completedAt, 1);
  }

  if (recentAccuracy < 90) {
    return addDays(completedAt, 3);
  }

  return addDays(completedAt, mastered ? 14 : 7);
}

export function updateSkillMastery(input: {
  previous: SkillMastery[];
  profileId?: string;
  lesson: StructuredLesson;
  metrics: LessonSessionMetrics;
  completedAt: string;
}): SkillMastery[] {
  const profileId = input.profileId ?? 'default';
  const patternKey = inferPatternKey(input.lesson);
  const targetSkills = inferTargetSkills(input.lesson);
  let nextRecords = [...input.previous];

  targetSkills.forEach((skill) => {
    const recentAccuracy = metricForSkill(skill, input.metrics);
    const existingIndex = nextRecords.findIndex(
      (record) => record.profileId === profileId && record.skill === skill && record.patternKey === patternKey,
    );
    const existing = existingIndex >= 0 ? nextRecords[existingIndex] : undefined;
    const highAccuracyStreak = recentAccuracy >= 90 ? (existing?.highAccuracyStreak ?? 0) + 1 : 0;
    const mastered = highAccuracyStreak >= 3;
    const updated: SkillMastery = {
      profileId,
      skill,
      patternKey,
      attempts: (existing?.attempts ?? 0) + 1,
      recentAccuracy,
      mastered,
      lastPracticedAt: input.completedAt,
      nextReviewAt: nextReviewDate(input.completedAt, recentAccuracy, mastered),
      highAccuracyStreak,
    };

    nextRecords =
      existingIndex >= 0
        ? nextRecords.map((record, index) => (index === existingIndex ? updated : record))
        : [...nextRecords, updated];
  });

  return nextRecords;
}
