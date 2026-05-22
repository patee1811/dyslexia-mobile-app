export type ValidationLevel = 'info' | 'warning' | 'suggestion';

export type ValidationWarning = {
  level: ValidationLevel;
  message: string;
};

export type ValidatorResult = {
  isValid: boolean;
  warnings: ValidationWarning[];
};

export interface ValidateCustomLessonInput {
  title: string;
  text: string;
  focusSkill?: string;
  childReadingLevel?: string;
}

function wordsFrom(text: string) {
  return text
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[.,!?;:()"']/g, '').trim())
    .filter(Boolean);
}

function sentencesFrom(text: string) {
  return text
    .split(/[.!?\n]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function countWords(text: string) {
  return wordsFrom(text).length;
}

function countLongWords(text: string) {
  return wordsFrom(text).filter((word) => word.length >= 7).length;
}

function getMaxSentenceLength(readingLevel?: string) {
  const normalized = (readingLevel ?? '').toLowerCase();

  if (normalized.includes('nền') || normalized.includes('foundation') || normalized.includes('câu ngắn')) {
    return 9;
  }

  if (normalized.includes('đoạn') || normalized.includes('building')) {
    return 13;
  }

  return 16;
}

export function validateCustomLessonDraft(input: ValidateCustomLessonInput): ValidatorResult {
  const warnings: ValidationWarning[] = [];
  const text = input.text.trim();

  if (!text) {
    return {
      isValid: false,
      warnings: [
        {
          level: 'warning',
          message: 'Bài học đang trống. Vui lòng nhập 2-4 câu ngắn để trẻ luyện.',
        },
      ],
    };
  }

  const sentences = sentencesFrom(text);
  const wordCount = countWords(text);
  const maxSentenceLength = getMaxSentenceLength(input.childReadingLevel);
  const sentenceLengths = sentences.map(countWords);
  const longestSentence = Math.max(...sentenceLengths, 0);
  const longWordCount = countLongWords(text);
  const longWordRatio = wordCount > 0 ? longWordCount / wordCount : 0;

  if (wordCount < 6) {
    warnings.push({
      level: 'warning',
      message: 'Bài này hơi ngắn. Nên có ít nhất 2 câu hoặc 6-8 từ để trẻ luyện có ngữ cảnh.',
    });
  }

  if (sentences.length > 5) {
    warnings.push({
      level: 'suggestion',
      message: 'Bài này có khá nhiều câu. Nên chia thành 2 bài nhỏ để trẻ không bị quá tải.',
    });
  }

  if (wordCount > 90) {
    warnings.push({
      level: 'warning',
      message: 'Bài này quá dài cho một lượt luyện ngắn. Nên giữ khoảng 20-60 từ hoặc chia thành 2 bài.',
    });
  }

  if (longestSentence > maxSentenceLength) {
    warnings.push({
      level: 'suggestion',
      message: `Bài này có câu hơi dài (${longestSentence} từ). Nên chia thành 2 câu ngắn hơn.`,
    });
  }

  if (longWordRatio > 0.35) {
    warnings.push({
      level: 'suggestion',
      message: 'Bài này có nhiều từ dài/từ mới. Nếu trẻ vừa học dấu thanh, hãy giảm bớt từ khó.',
    });
  }

  if (!input.focusSkill?.trim()) {
    warnings.push({
      level: 'info',
      message: 'Nên ghi rõ một kỹ năng trọng tâm, ví dụ: dấu sắc/nặng hoặc vần an/ang.',
    });
  }

  if (input.focusSkill && wordCount > 70) {
    warnings.push({
      level: 'suggestion',
      message: 'Bài khá dài so với một kỹ năng trọng tâm. Cân nhắc tách bài để mỗi lượt chỉ luyện một mục tiêu.',
    });
  }

  if (sentences.length >= 2 && sentences.length <= 4 && wordCount <= 60 && longestSentence <= maxSentenceLength) {
    warnings.push({
      level: 'info',
      message: 'Độ dài bài đang phù hợp cho một buổi luyện ngắn.',
    });
  }

  return {
    isValid: warnings.every((warning) => warning.level !== 'warning'),
    warnings,
  };
}

export function suggestLessonImprovement(input: ValidateCustomLessonInput): string[] {
  return validateCustomLessonDraft(input)
    .warnings.filter((warning) => warning.level !== 'info')
    .map((warning) => warning.message);
}
