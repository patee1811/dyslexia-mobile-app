export type LiteracySkill =
  | 'phonological_awareness'
  | 'sound_symbol'
  | 'syllable_blending'
  | 'tone_discrimination'
  | 'vietnamese_spelling_rule'
  | 'word_reading'
  | 'sentence_fluency'
  | 'comprehension';

export type VietnameseTone =
  | 'ngang'
  | 'huyen'
  | 'sac'
  | 'hoi'
  | 'nga'
  | 'nang';

export type VietnamesePattern = {
  onset?: string;
  rime?: string;
  tone?: VietnameseTone;
  graphemes?: string[];
  contrastSet?: string[];
  regionSensitive?: boolean;
};

export type LessonTask =
  | {
      id: string;
      type: 'listen_choose';
      promptText: string;
      options: string[];
      answer: string;
      instruction: string;
    }
  | {
      id: string;
      type: 'sound_to_letter';
      soundLabel: string;
      options: string[];
      answer: string;
      instruction: string;
    }
  | {
      id: string;
      type: 'blend_syllable';
      onset: string;
      rime: string;
      tone?: VietnameseTone;
      answer: string;
      instruction: string;
    }
  | {
      id: string;
      type: 'tone_minimal_pair';
      base: string;
      options: string[];
      answer: string;
      instruction: string;
    }
  | {
      id: string;
      type: 'read_word';
      word: string;
      supports: string[];
      instruction: string;
    }
  | {
      id: string;
      type: 'read_sentence';
      sentence: string;
      instruction: string;
    }
  | {
      id: string;
      type: 'comprehension';
      question: string;
      options: string[];
      answer: string;
      instruction: string;
    }
  | {
      id: string;
      type: 'dictation_spelling';
      promptText: string;
      audioText: string;
      answer: string;
      options?: string[];
      instruction: string;
    }
  | {
      id: string;
      type: 'match_word_meaning';
      word: string;
      imageLabel: string;
      options: string[];
      answer: string;
      instruction: string;
    }
  | {
      id: string;
      type: 'story_retell';
      story: string;
      promptText: string;
      minWords: number;
      instruction: string;
    }
  | {
      id: string;
      type: 'personalized_review';
      promptText: string;
      fallbackItems: string[];
      instruction: string;
    };

export type StructuredLesson = {
  id: string;
  title: string;
  level: number;
  estimatedMinutes: number;
  targetSkills: LiteracySkill[];
  targetPattern: VietnamesePattern;
  prerequisiteLessonIds: string[];
  tasks: LessonTask[];
  mastery: {
    minAccuracy: number;
    minAttempts: number;
    reviewAfterDays: number[];
  };
  caregiverTip: string;
  safetyNote: string;
};
