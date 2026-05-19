import type {
  HciChecklistGroup,
  LearnerRecord,
  Lesson,
  PracticePreferences,
  ThemeOption,
} from '../types';
import { structuredLessons as structuredLessonData } from './structuredLessons';
import type { LessonTask as StructuredLessonTask, StructuredLesson } from '../types/literacy';

export { skillTree } from './skillTree';
export { structuredLessons } from './structuredLessons';
export { vietnamesePatterns } from './vietnamesePatterns';

export const themeOptions: ThemeOption[] = [
  {
    id: 'sun',
    name: 'Nắng dịu',
    background: '#F7F1E3',
    surface: '#FFF9ED',
    surfaceAlt: '#F2E7C9',
    accent: '#C76D3A',
    accentSoft: '#F7D5BC',
    text: '#3A2A1A',
    subtext: '#6E5945',
    border: '#E4D1BE',
  },
  {
    id: 'mint',
    name: 'Lá non',
    background: '#EDF6F1',
    surface: '#F9FFFC',
    surfaceAlt: '#DDEFE7',
    accent: '#2E7D66',
    accentSoft: '#C8E8DC',
    text: '#17392E',
    subtext: '#4F6F64',
    border: '#CFE2D9',
  },
  {
    id: 'sky',
    name: 'Trời sáng',
    background: '#EFF5FB',
    surface: '#FCFDFF',
    surfaceAlt: '#DCEBFA',
    accent: '#2F6FB8',
    accentSoft: '#D3E4FB',
    text: '#17314F',
    subtext: '#56708F',
    border: '#D0DDED',
  },
];

export const defaultPreferences: PracticePreferences = {
  fontScale: 1.08,
  lineSpacing: 1.28,
  chunkSize: 1,
  focusMode: true,
  superFocus: false,
  reduceMotion: false,
  showSyllables: false,
  themeId: 'sun',
  readerFont: 'default',
  letterSpacing: 0.2,
  azureVoice: 'vi-VN-HoaiMyNeural',
  allowCloud: true,
  speechRate: 'slow',
  voiceMode: 'female',
};

export const baseLessons: Lesson[] = [
  {
    id: 'garden-morning',
    title: 'Vườn nắng buổi sáng',
    difficulty: 'foundation',
    topic: 'Thiên nhiên quen thuộc',
    estimatedMinutes: 8,
    focusSkill: 'Phân biệt âm đầu và giữ nhịp đọc chậm',
    coachGoal: 'Nhận ra từ dễ nhầm và đọc trọn câu ngắn mà không bị vội.',
    warmup: [
      { word: 'nắng', syllables: 'nă-ng', cue: 'Âm đầu /n/ mềm, đọc ngắn và dứt khoát.', example: 'Nắng chiếu qua cửa sổ.' },
      { word: 'lá', syllables: 'lá', cue: 'Từ rất ngắn, chú ý dấu sắc.', example: 'Lá rung nhẹ trên cành.' },
      { word: 'chậm', syllables: 'chậm', cue: 'Giữ môi và lưỡi chậm ở cuối từ.', example: 'Đọc chậm giúp nhìn rõ chữ.' },
    ],
    sentences: [
      'Buổi sáng, An ra vườn khi nắng vừa lên.',
      'Em nhìn từng chiếc lá và đọc tên các màu thật chậm.',
      'Khi gặp từ khó, An chạm vào thẻ gợi ý rồi đọc lại một lần nữa.',
      'Đọc xong, em kể cho mẹ nghe khu vườn hôm nay có gì mới.',
    ],
    questions: [
      {
        id: 'garden-q1',
        prompt: 'An làm gì khi gặp từ khó?',
        options: ['Bỏ qua luôn', 'Chạm vào thẻ gợi ý rồi đọc lại', 'Nhờ mẹ đọc hộ'],
        answerIndex: 1,
        explanation: 'Bài đọc nhấn mạnh việc dùng gợi ý rồi đọc lại để tăng tự tin.',
      },
      {
        id: 'garden-q2',
        prompt: 'Bài đọc diễn ra ở đâu?',
        options: ['Trong lớp học', 'Ngoài sân chơi', 'Trong khu vườn'],
        answerIndex: 2,
        explanation: 'Toàn bộ đoạn văn diễn ra trong khu vườn buổi sáng.',
      },
    ],
    caregiverTip: 'Sau buổi đọc, hỏi trẻ kể lại 1-2 chi tiết thay vì yêu cầu đọc lại toàn bộ đoạn.',
    createdBy: 'system',
  },
  {
    id: 'paper-boat',
    title: 'Chiếc thuyền giấy',
    difficulty: 'building',
    topic: 'Trò chơi ở nhà',
    estimatedMinutes: 9,
    focusSkill: 'Giữ thứ tự chữ trong từ có âm gần nhau',
    coachGoal: 'Luyện đọc nhóm từ có vần gần giống mà không đảo chữ.',
    warmup: [
      { word: 'thuyền', syllables: 'thuyền', cue: 'Đọc trọn cụm /thuyền/, không tách thành hai nhịp quá mạnh.', example: 'Thuyền giấy nổi trên nước.' },
      { word: 'trôi', syllables: 'trôi', cue: 'Âm đầu /tr/ chắc, kéo nhẹ ở vần /ôi/.', example: 'Chiếc lá trôi rất chậm.' },
      { word: 'dòng', syllables: 'dòng', cue: 'Nhấn vừa đủ ở dấu huyền để từ không bị cụt.', example: 'Dòng nước chảy yên.' },
    ],
    sentences: [
      'An gấp một chiếc thuyền giấy màu xanh sau giờ học.',
      'Em đặt thuyền vào chậu nước và nhìn nó trôi theo vòng tròn nhỏ.',
      'Mỗi lần thuyền nghiêng sang một bên, An lại đọc chậm câu vừa nói.',
      'Nhờ vậy, em nhớ đúng thứ tự chữ trong các từ mới.',
    ],
    questions: [
      {
        id: 'boat-q1',
        prompt: 'Chiếc thuyền có màu gì?',
        options: ['Màu xanh', 'Màu đỏ', 'Màu vàng'],
        answerIndex: 0,
        explanation: 'Ngay câu đầu tiên cho biết thuyền giấy màu xanh.',
      },
      {
        id: 'boat-q2',
        prompt: 'Vì sao An đọc chậm câu vừa nói?',
        options: ['Để nhớ đúng thứ tự chữ', 'Để chơi lâu hơn', 'Để chờ mẹ nghe'],
        answerIndex: 0,
        explanation: 'Đây là mục tiêu chính của bài luyện đọc này.',
      },
    ],
    caregiverTip: 'Cho trẻ chỉ tay theo từng từ khi đọc để giảm đảo thứ tự chữ.',
    createdBy: 'system',
  },
  {
    id: 'book-fair',
    title: 'Ngày hội đọc sách',
    difficulty: 'stretch',
    topic: 'Hoạt động ở trường',
    estimatedMinutes: 10,
    focusSkill: 'Đọc hiểu và ghi nhớ ý chính',
    coachGoal: 'Giữ mạch đọc qua nhiều câu và trả lời được câu hỏi nội dung.',
    warmup: [
      { word: 'gian', syllables: 'gian', cue: 'Đừng đọc lẫn với “giang”; dừng rõ ở cuối từ.', example: 'Mỗi gian trưng bày một chủ đề.' },
      { word: 'nội dung', syllables: 'nội-dung', cue: 'Tách làm hai nhịp vừa đủ để hiểu nghĩa.', example: 'Con kể lại nội dung chính.' },
      { word: 'tự tin', syllables: 'tự-tin', cue: 'Giữ nhịp đều cho cả cụm từ.', example: 'Con đọc tự tin hơn hôm qua.' },
    ],
    sentences: [
      'Trường của An tổ chức một ngày hội đọc sách vào thứ sáu.',
      'Mỗi lớp có một gian nhỏ để giới thiệu cuốn sách các bạn yêu thích.',
      'An chọn một truyện ngắn về biển và luyện đọc trước khi lên chia sẻ.',
      'Khi đứng trước lớp, em đọc chậm từng câu rồi nói lại nội dung chính bằng lời của mình.',
    ],
    questions: [
      {
        id: 'book-q1',
        prompt: 'An chọn loại sách nào để chia sẻ?',
        options: ['Một truyện ngắn về biển', 'Một bài thơ về mưa', 'Một quyển sách toán'],
        answerIndex: 0,
        explanation: 'Câu thứ ba nêu rõ An chọn truyện ngắn về biển.',
      },
      {
        id: 'book-q2',
        prompt: 'Sau khi đọc, An làm gì?',
        options: ['Ngồi xuống ngay', 'Nói lại nội dung chính bằng lời của mình', 'Nhờ cô giáo giải thích'],
        answerIndex: 1,
        explanation: 'Đây là hành động cho thấy trẻ hiểu và nhớ nội dung.',
      },
    ],
    caregiverTip: 'Khuyến khích trẻ kể lại ý chính bằng câu ngắn; không cần lặp lại nguyên văn.',
    createdBy: 'system',
  },
];

const skillLabels: Record<StructuredLesson['targetSkills'][number], string> = {
  phonological_awareness: 'Nhận biết âm thanh tiếng Việt',
  sound_symbol: 'Nhận diện âm đầu và chữ ghi âm',
  syllable_blending: 'Ghép âm/vần thành tiếng',
  tone_discrimination: 'Phân biệt dấu thanh',
  vietnamese_spelling_rule: 'Quy tắc chính tả tiếng Việt',
  word_reading: 'Đọc từ',
  sentence_fluency: 'Đọc câu ngắn lưu loát',
  comprehension: 'Đọc hiểu',
};

function lessonDifficulty(level: number): Lesson['difficulty'] {
  if (level <= 1) {
    return 'foundation';
  }

  if (level <= 3) {
    return 'building';
  }

  return 'stretch';
}

function taskText(task: StructuredLessonTask) {
  switch (task.type) {
    case 'listen_choose':
      return task.answer;
    case 'sound_to_letter':
      return task.answer;
    case 'blend_syllable':
      return task.answer;
    case 'tone_minimal_pair':
      return task.answer;
    case 'read_word':
      return task.word;
    case 'read_sentence':
      return task.sentence;
    case 'comprehension':
      return task.question;
    case 'dictation_spelling':
      return task.answer;
    case 'match_word_meaning':
      return task.word;
    case 'story_retell':
      return task.story;
    case 'personalized_review':
      return task.fallbackItems[0] ?? task.promptText;
    default:
      return '';
  }
}

function structuredLessonToLegacyLesson(lesson: StructuredLesson, index: number): Lesson {
  const readWords = lesson.tasks.filter((task): task is Extract<StructuredLessonTask, { type: 'read_word' }> => task.type === 'read_word');
  const readSentences = lesson.tasks.filter(
    (task): task is Extract<StructuredLessonTask, { type: 'read_sentence' }> => task.type === 'read_sentence',
  );
  const comprehensionTasks = lesson.tasks.filter(
    (task): task is Extract<StructuredLessonTask, { type: 'comprehension' }> => task.type === 'comprehension',
  );
  const fallbackWords = [...new Set(lesson.tasks.map(taskText).filter((text) => text && !text.includes(' ')))].slice(0, 3);
  const warmupSource = readWords.length ? readWords : fallbackWords.map((word) => ({ word, supports: [], instruction: '' }));
  const focusSkill = lesson.targetSkills.map((skill) => skillLabels[skill]).join(' + ');

  return {
    id: lesson.id,
    title: lesson.title,
    difficulty: lessonDifficulty(lesson.level),
    topic: focusSkill,
    estimatedMinutes: lesson.estimatedMinutes,
    focusSkill,
    coachGoal: `Luyện ${focusSkill.toLowerCase()} qua chuỗi nghe, ghép, đọc từ, đọc câu và hiểu bài.`,
    warmup: warmupSource.slice(0, 4).map((task) => ({
      word: task.word,
      syllables: task.word,
      cue: 'Nhìn kỹ mặt chữ, nghe mẫu nếu cần, rồi đọc lại chậm.',
      example: task.supports?.[0] ?? lesson.caregiverTip,
    })),
    sentences: readSentences.length ? readSentences.map((task) => task.sentence) : [`Con luyện đọc tiếng ${fallbackWords[0] ?? 'mới'}.`],
    questions: comprehensionTasks.map((task) => ({
      id: task.id,
      prompt: task.question,
      options: task.options,
      answerIndex: Math.max(0, task.options.findIndex((option) => option === task.answer)),
      explanation: 'Câu hỏi kiểm tra ý chính của câu vừa đọc.',
    })),
    caregiverTip: lesson.caregiverTip,
    createdBy: 'system',
    targetSkills: lesson.targetSkills,
    targetPattern: {
      ...lesson.targetPattern,
      key: lesson.id,
      patternKey: lesson.id,
      skill: lesson.targetSkills[0],
      type: lesson.targetSkills[0],
      value: lesson.targetPattern.contrastSet?.join('/') ?? lesson.title,
    },
    prerequisiteLessonIds: lesson.prerequisiteLessonIds,
    prerequisites: lesson.prerequisiteLessonIds,
    mastery: lesson.mastery,
    structuredTasks: lesson.tasks,
    safetyNote: lesson.safetyNote,
    order: index,
    sourceStructuredLessonId: lesson.id,
  };
}

const supplementalStructuredLessons: StructuredLesson[] = [
  {
    id: 'dictation-spelling-ng-ngh-13',
    title: 'Nghe viết quy tắc ng/ngh',
    level: 4,
    estimatedMinutes: 7,
    targetSkills: ['vietnamese_spelling_rule', 'word_reading'],
    targetPattern: {
      graphemes: ['ng', 'ngh'],
      contrastSet: ['nghe', 'nghỉ', 'nga', 'ngô'],
      regionSensitive: false,
    },
    prerequisiteLessonIds: ['spelling-ng-ngh-11'],
    tasks: [
      {
        id: 'dictation-ng-ngh-listen',
        type: 'listen_choose',
        promptText: 'Nghe tiếng mẫu rồi chọn tiếng đúng.',
        options: ['nghe', 'nge', 'ghe'],
        answer: 'nghe',
        instruction: 'Nghe chậm, nhìn chữ e sau âm đầu để chọn ngh.',
      },
      {
        id: 'dictation-ng-ngh-write',
        type: 'dictation_spelling',
        promptText: 'Nghe và gõ lại tiếng con nghe được.',
        audioText: 'nghe',
        answer: 'nghe',
        options: ['nghe', 'nghê', 'nge'],
        instruction: 'Bấm nghe mẫu, sau đó nhập hoặc chọn cách viết đúng.',
      },
      {
        id: 'dictation-ng-ngh-word',
        type: 'read_word',
        word: 'nghỉ',
        supports: ['Nhìn cụm ngh', 'Nhìn chữ i sau đó', 'Đọc cả tiếng'],
        instruction: 'Đọc tiếng nghỉ thật rõ.',
      },
      {
        id: 'dictation-ng-ngh-sentence',
        type: 'read_sentence',
        sentence: 'Bé nghe bà kể chuyện rồi nghỉ.',
        instruction: 'Đọc câu ngắn, chú ý nghe và nghỉ.',
      },
      {
        id: 'dictation-ng-ngh-comprehension',
        type: 'comprehension',
        question: 'Bé làm gì sau khi nghe chuyện?',
        options: ['Nghỉ', 'Chạy', 'Vẽ'],
        answer: 'Nghỉ',
        instruction: 'Chọn ý đúng theo câu vừa đọc.',
      },
    ],
    mastery: {
      minAccuracy: 0.82,
      minAttempts: 2,
      reviewAfterDays: [1, 3, 7],
    },
    caregiverTip: 'Khi trẻ nhầm ng/ngh, nhắc trẻ nhìn nguyên âm đứng sau âm đầu trước khi viết.',
    safetyNote: 'Bài học chỉ hỗ trợ luyện đọc/chính tả, không dùng để chẩn đoán.',
  },
  {
    id: 'match-word-meaning-14',
    title: 'Nối từ với tranh và nghĩa',
    level: 4,
    estimatedMinutes: 7,
    targetSkills: ['word_reading', 'comprehension'],
    targetPattern: {
      graphemes: ['lá', 'na', 'sách'],
      contrastSet: ['lá', 'na', 'sách'],
      regionSensitive: false,
    },
    prerequisiteLessonIds: ['sentence-short-review-12'],
    tasks: [
      {
        id: 'match-word-meaning-listen',
        type: 'listen_choose',
        promptText: 'Nghe từ mẫu rồi chọn từ đúng.',
        options: ['lá', 'na', 'sách'],
        answer: 'lá',
        instruction: 'Nghe từ và nhìn mặt chữ trước khi chọn.',
      },
      {
        id: 'match-word-meaning-card',
        type: 'match_word_meaning',
        word: 'lá',
        imageLabel: '🍃',
        options: ['Phần màu xanh trên cây', 'Một loại quả tròn', 'Đồ dùng để đọc'],
        answer: 'Phần màu xanh trên cây',
        instruction: 'Nhìn tranh gợi ý rồi nối từ với nghĩa đúng.',
      },
      {
        id: 'match-word-meaning-word',
        type: 'read_word',
        word: 'lá',
        supports: ['Nhìn dấu sắc', 'Nối với tranh chiếc lá'],
        instruction: 'Đọc từ lá sau khi hiểu nghĩa.',
      },
      {
        id: 'match-word-meaning-sentence',
        type: 'read_sentence',
        sentence: 'Lan nhặt chiếc lá xanh.',
        instruction: 'Đọc câu ngắn và nhớ nghĩa của từ lá.',
      },
      {
        id: 'match-word-meaning-comprehension',
        type: 'comprehension',
        question: 'Lan nhặt gì?',
        options: ['Chiếc lá xanh', 'Quả na', 'Quyển sách'],
        answer: 'Chiếc lá xanh',
        instruction: 'Chọn đáp án đúng theo câu.',
      },
    ],
    mastery: {
      minAccuracy: 0.82,
      minAttempts: 2,
      reviewAfterDays: [1, 4, 8],
    },
    caregiverTip: 'Cho trẻ nói nghĩa của từ bằng lời của mình trước khi đọc câu.',
    safetyNote: 'Bài học hỗ trợ vốn từ và đọc hiểu, không dùng để đánh giá y khoa.',
  },
  {
    id: 'story-retell-short-15',
    title: 'Kể lại câu chuyện ngắn',
    level: 4,
    estimatedMinutes: 8,
    targetSkills: ['sentence_fluency', 'comprehension'],
    targetPattern: {
      contrastSet: ['đọc câu', 'kể lại', 'ý chính'],
      regionSensitive: false,
    },
    prerequisiteLessonIds: ['match-word-meaning-14'],
    tasks: [
      {
        id: 'story-retell-listen',
        type: 'listen_choose',
        promptText: 'Nghe câu chuyện ngắn rồi chọn nhân vật chính.',
        options: ['Lan', 'Nam', 'Bà'],
        answer: 'Lan',
        instruction: 'Nghe chậm và nhớ nhân vật chính.',
      },
      {
        id: 'story-retell-read',
        type: 'read_sentence',
        sentence: 'Lan nhặt lá xanh. Lan tặng lá cho bà. Bà mỉm cười.',
        instruction: 'Đọc từng câu ngắn, nghỉ một nhịp sau dấu chấm.',
      },
      {
        id: 'story-retell-task',
        type: 'story_retell',
        story: 'Lan nhặt lá xanh. Lan tặng lá cho bà. Bà mỉm cười.',
        promptText: 'Con hãy kể lại câu chuyện bằng lời của mình.',
        minWords: 4,
        instruction: 'Không cần kể giống hệt. Chỉ cần nói lại ý chính bằng vài từ hoặc một câu ngắn.',
      },
      {
        id: 'story-retell-comprehension',
        type: 'comprehension',
        question: 'Lan tặng lá cho ai?',
        options: ['Bà', 'Bạn', 'Mẹ'],
        answer: 'Bà',
        instruction: 'Chọn người nhận chiếc lá.',
      },
    ],
    mastery: {
      minAccuracy: 0.78,
      minAttempts: 2,
      reviewAfterDays: [1, 4, 8],
    },
    caregiverTip: 'Khi trẻ kể lại, chấp nhận câu ngắn và ý chính; không yêu cầu lặp lại nguyên văn.',
    safetyNote: 'Bài học hỗ trợ đọc hiểu và diễn đạt, không dùng để chẩn đoán.',
  },
  {
    id: 'personalized-error-review-16',
    title: 'Ôn lỗi hay gặp của con',
    level: 4,
    estimatedMinutes: 6,
    targetSkills: ['word_reading', 'comprehension'],
    targetPattern: {
      contrastSet: ['từ khó', 'dấu/vần cần ôn'],
      regionSensitive: true,
    },
    prerequisiteLessonIds: [],
    tasks: [
      {
        id: 'personalized-review-task',
        type: 'personalized_review',
        promptText: 'Ôn lại các từ hoặc nhóm lỗi con hay gặp gần đây.',
        fallbackItems: ['lá', 'lạ', 'nghe', 'an/ang'],
        instruction: 'Chạm từng mục để nghe mẫu, rồi đọc lại thật chậm.',
      },
      {
        id: 'personalized-review-sentence',
        type: 'read_sentence',
        sentence: 'Con đọc lại từ khó thật chậm.',
        instruction: 'Đọc câu ngắn sau khi ôn từ khó.',
      },
      {
        id: 'personalized-review-comprehension',
        type: 'comprehension',
        question: 'Khi gặp từ khó, con nên làm gì?',
        options: ['Nghe mẫu rồi đọc chậm', 'Bỏ qua luôn', 'Đọc thật nhanh'],
        answer: 'Nghe mẫu rồi đọc chậm',
        instruction: 'Chọn cách hỗ trợ nhẹ nhàng nhất.',
      },
    ],
    mastery: {
      minAccuracy: 0.75,
      minAttempts: 1,
      reviewAfterDays: [1, 3],
    },
    caregiverTip: 'Ưu tiên 3-5 từ hay lỗi nhất, không ôn quá nhiều trong một lượt.',
    safetyNote: 'Phần ôn cá nhân hóa chỉ dựa trên dữ liệu luyện tập trong app, không phải chẩn đoán.',
  },
];

const allStructuredLessons = [...structuredLessonData, ...supplementalStructuredLessons];

export const curriculumLessons: Lesson[] = [
  ...allStructuredLessons.map(structuredLessonToLegacyLesson),
  ...baseLessons.map((lesson, index) => ({
    ...lesson,
    order: allStructuredLessons.length + index,
  })),
];

export const initialLearnerRecords: LearnerRecord[] = [
  {
    profile: {
      id: 'an',
      name: 'Bé An',
      age: 8,
      region: 'north',
      readingLevel: 'Đang củng cố câu ngắn 2-3 dòng',
      weeklyGoal: 5,
      streakDays: 4,
      calmMinutesTarget: 10,
      supportNeeds: ['Chữ to, khoảng dòng rộng', 'Đoạn ngắn, ít xao nhãng', 'Ôn lại từ dễ nhầm bằng nhiều lần chạm'],
      strengths: ['Thích kể lại nội dung sau khi đọc', 'Phản hồi tốt với nhịp học ngắn'],
      interests: ['Động vật', 'Sách tranh', 'Các hoạt động ngoài trời'],
      rewardPoints: 24,
      latestBadge: 'Bình tĩnh đọc chậm',
    },
    preferences: defaultPreferences,
    lessonProgress: [
      {
        lessonId: 'garden-morning',
        attempts: 2,
        bestAccuracy: 0.82,
        lastCompletedAt: '2026-04-17T08:10:00+07:00',
        flaggedWords: ['nắng', 'chậm'],
      },
      {
        lessonId: 'paper-boat',
        attempts: 1,
        bestAccuracy: 0.7,
        lastCompletedAt: '2026-04-16T18:20:00+07:00',
        flaggedWords: ['thuyền', 'trôi'],
      },
      {
        lessonId: 'book-fair',
        attempts: 0,
        bestAccuracy: 0,
        flaggedWords: [],
      },
    ],
    history: [
      {
        id: 'an-history-1',
        profileId: 'an',
        lessonId: 'paper-boat',
        lessonTitle: 'Chiếc thuyền giấy',
        date: '2026-04-16T18:20:00+07:00',
        accuracy: 0.7,
        minutes: 9,
        flaggedWords: ['thuyền', 'trôi'],
        note: 'Cần ôn thêm nhóm từ có âm đầu gần nhau.',
        fluencyRating: 3,
      },
      {
        id: 'an-history-2',
        profileId: 'an',
        lessonId: 'garden-morning',
        lessonTitle: 'Vườn nắng buổi sáng',
        date: '2026-04-17T08:10:00+07:00',
        accuracy: 0.82,
        minutes: 8,
        flaggedWords: ['nắng', 'chậm'],
        note: 'Đọc chậm ổn định hơn, trả lời đúng 1/2 câu hỏi.',
        fluencyRating: 4,
      },
      {
        id: 'an-history-3',
        profileId: 'an',
        lessonId: 'garden-morning',
        lessonTitle: 'Vườn nắng buổi sáng',
        date: '2026-04-18T07:40:00+07:00',
        accuracy: 0.88,
        minutes: 8,
        flaggedWords: ['lá'],
        note: 'Ít bỏ sót chữ, cần tăng tự tin khi kể lại ý chính.',
        fluencyRating: 4,
      },
    ],
    notes: [
      {
        id: 'an-note-1',
        profileId: 'an',
        lessonId: 'garden-morning',
        createdAt: '2026-04-18T07:50:00+07:00',
        text: 'Buổi sáng hợp tác tốt hơn buổi tối.',
      },
    ],
    onboarding: {
      step: 0,
      completed: false,
    },
  },
  {
    profile: {
      id: 'mai',
      name: 'Bé Mai',
      age: 9,
      region: 'south',
      readingLevel: 'Đang luyện tốc độ với đoạn quen thuộc',
      weeklyGoal: 4,
      streakDays: 2,
      calmMinutesTarget: 8,
      supportNeeds: ['Câu rõ nghĩa', 'Nhiều nhắc lại bằng âm thanh'],
      strengths: ['Nhớ tốt nội dung tranh minh họa', 'Thích phần thưởng nhỏ'],
      interests: ['Biển', 'Mèo', 'Gấp giấy'],
      rewardPoints: 16,
      latestBadge: 'Giữ nhịp đều',
    },
    preferences: {
      ...defaultPreferences,
      themeId: 'mint',
      showSyllables: true,
      readerFont: 'serif',
      azureVoice: 'vi-VN-NamMinhNeural',
    },
    lessonProgress: [
      {
        lessonId: 'garden-morning',
        attempts: 1,
        bestAccuracy: 0.76,
        lastCompletedAt: '2026-04-17T19:00:00+07:00',
        flaggedWords: ['lá'],
      },
      {
        lessonId: 'paper-boat',
        attempts: 2,
        bestAccuracy: 0.84,
        lastCompletedAt: '2026-04-18T18:00:00+07:00',
        flaggedWords: ['dòng'],
      },
      {
        lessonId: 'book-fair',
        attempts: 1,
        bestAccuracy: 0.72,
        lastCompletedAt: '2026-04-15T18:30:00+07:00',
        flaggedWords: ['gian'],
      },
    ],
    history: [
      {
        id: 'mai-history-1',
        profileId: 'mai',
        lessonId: 'book-fair',
        lessonTitle: 'Ngày hội đọc sách',
        date: '2026-04-15T18:30:00+07:00',
        accuracy: 0.72,
        minutes: 10,
        flaggedWords: ['gian'],
        note: 'Hiểu ý chính nhưng còn ngập ngừng.',
        fluencyRating: 3,
      },
      {
        id: 'mai-history-2',
        profileId: 'mai',
        lessonId: 'paper-boat',
        lessonTitle: 'Chiếc thuyền giấy',
        date: '2026-04-18T18:00:00+07:00',
        accuracy: 0.84,
        minutes: 8,
        flaggedWords: ['dòng'],
        note: 'Đọc ổn hơn khi nghe mẫu từng câu.',
        fluencyRating: 4,
      },
    ],
    notes: [],
    onboarding: {
      step: 2,
      completed: false,
    },
  },
];

export const homeHighlights = [
  {
    title: 'Lộ trình ngắn 3 bước',
    body: 'Khởi động từ khó, đọc từng câu lớn rõ, rồi kiểm tra hiểu bài bằng câu hỏi đơn giản.',
  },
  {
    title: 'Tương tác thích nghi',
    body: 'App tự gợi ý bài tiếp theo dựa trên từ từng bị đánh dấu và độ chính xác của buổi gần nhất.',
  },
  {
    title: 'Theo dõi dễ giải thích',
    body: 'Phụ huynh và giáo viên chỉ thấy các chỉ số hỗ trợ luyện đọc, không có tuyên bố chẩn đoán.',
  },
];

export const onboardingSteps = [
  {
    title: 'Chọn hồ sơ phù hợp',
    body: 'Mỗi trẻ có tiến độ, từ khó và giao diện cá nhân hóa riêng.',
  },
  {
    title: 'Luyện trong 8-10 phút',
    body: 'Mỗi buổi chỉ nên ngắn, rõ và có phản hồi ngay khi gặp từ khó.',
  },
  {
    title: 'Xem báo cáo sau buổi học',
    body: 'Tab Theo dõi gom lại độ chính xác, từ cần ôn và gợi ý bài tiếp theo.',
  },
];

export const hciChecklistGroups: HciChecklistGroup[] = [
  {
    title: 'Nguyên lý thiết kế áp dụng',
    items: [
      'Một màn hình tập trung vào một nhiệm vụ chính để giảm tải nhận thức.',
      'Chữ lớn, nền dịu, khoảng dòng rộng giúp giảm áp lực thị giác.',
      'Phản hồi tức thì khi đánh dấu từ khó hoặc trả lời câu hỏi.',
      'Cho phép điều chỉnh giao diện ngay trong buổi học mà không rời luồng đọc.',
    ],
  },
  {
    title: 'Cơ sở từ tài liệu HCI',
    items: [
      'The Human: tôn trọng giới hạn trí nhớ ngắn hạn bằng câu ngắn và gợi ý rõ.',
      'Design Rules: tăng visibility, feedback, consistency và error recovery.',
      'HCI in Software Process: giữ persona, scenario và usability test gắn với từng màn hình.',
      'Socio-organizational issues: báo cáo ưu tiên ngắn gọn để phụ huynh và giáo viên dùng trong bối cảnh thật.',
    ],
  },
  {
    title: 'Kế hoạch usability test',
    items: [
      'Người tham gia: 5-10 phụ huynh, giáo viên hoặc người dùng đại diện.',
      'Nhiệm vụ: mở app, bắt đầu bài gợi ý, đánh dấu từ khó, nghe mẫu và xem tiến độ.',
      'Chỉ số: thời gian hoàn thành, số lần chạm nhầm, mức cần trợ giúp, mức hài lòng.',
      'Câu hỏi hậu kiểm: chữ đã đủ dễ đọc chưa, luồng có dễ hiểu không, báo cáo có đủ rõ không.',
    ],
  },
];
