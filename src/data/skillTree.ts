import type { LiteracySkill } from '../types/literacy';

type SkillCluster = {
  id: string;
  name: string;
  targetSkill: LiteracySkill;
  examples: string[];
  contrastSets: string[][];
  caregiverFocus: string;
};

type SpellingRuleCluster = {
  id: string;
  name: string;
  targetSkill: 'vietnamese_spelling_rule';
  graphemes: string[];
  examples: string[];
  ruleHint: string;
  caregiverFocus: string;
};

export const skillTree = {
  toneGroups: [
    {
      id: 'tones-ma',
      name: 'Dấu thanh với vần a và âm đầu m',
      targetSkill: 'tone_discrimination',
      examples: ['ma', 'mà', 'má', 'mả', 'mã', 'mạ'],
      contrastSets: [['ma', 'mà', 'má', 'mả', 'mã', 'mạ']],
      caregiverFocus: 'Cho trẻ nghe từng tiếng, nhìn dấu thanh, rồi đọc lại chậm.',
    },
    {
      id: 'tones-ba',
      name: 'Dấu thanh với vần a và âm đầu b',
      targetSkill: 'tone_discrimination',
      examples: ['ba', 'bà', 'bá', 'bả', 'bã', 'bạ'],
      contrastSets: [['ba', 'bà', 'bá', 'bả', 'bã', 'bạ']],
      caregiverFocus: 'Giữ một vần quen thuộc để trẻ tập trung vào dấu thanh.',
    },
    {
      id: 'tones-la',
      name: 'Dấu thanh với vần a và âm đầu l',
      targetSkill: 'tone_discrimination',
      examples: ['la', 'là', 'lá', 'lả', 'lã', 'lạ'],
      contrastSets: [['la', 'là', 'lá', 'lả', 'lã', 'lạ']],
      caregiverFocus: 'Đọc mẫu theo cặp gần nhau trước khi chuyển sang câu.',
    },
  ] satisfies SkillCluster[],
  onsetConfusions: [
    {
      id: 'onset-l-n',
      name: 'Âm đầu l / n',
      targetSkill: 'sound_symbol',
      examples: ['lá', 'ná', 'lan', 'nan'],
      contrastSets: [['lá', 'ná'], ['lan', 'nan']],
      caregiverFocus: 'Nhắc trẻ nhìn chữ đầu tiên trước khi đọc cả tiếng.',
    },
    {
      id: 'onset-ch-tr',
      name: 'Âm đầu ch / tr',
      targetSkill: 'sound_symbol',
      examples: ['cha', 'tra', 'chim', 'trim'],
      contrastSets: [['cha', 'tra'], ['chơi', 'trời']],
      caregiverFocus: 'Dùng từ ngắn, quen thuộc để giảm tải ghi nhớ.',
    },
    {
      id: 'onset-s-x',
      name: 'Âm đầu s / x',
      targetSkill: 'sound_symbol',
      examples: ['sao', 'xao', 'sinh', 'xinh'],
      contrastSets: [['sao', 'xao'], ['sinh', 'xinh']],
      caregiverFocus: 'Cho trẻ khoanh chữ đầu dễ nhầm rồi mới đọc tiếng.',
    },
    {
      id: 'onset-d-gi-r',
      name: 'Âm đầu d / gi / r',
      targetSkill: 'sound_symbol',
      examples: ['da', 'gia', 'ra', 'dạo', 'rạo'],
      contrastSets: [['da', 'gia', 'ra'], ['dạo', 'rạo']],
      caregiverFocus: 'Lưu ý khác biệt vùng miền; ưu tiên nhận diện mặt chữ.',
    },
    {
      id: 'onset-c-k-q',
      name: 'Âm đầu c / k / q',
      targetSkill: 'sound_symbol',
      examples: ['ca', 'ke', 'quê', 'qua'],
      contrastSets: [['ca', 'ka'], ['quê', 'kê']],
      caregiverFocus: 'Tách phần âm đầu và phần vần để trẻ thấy các cách ghi âm /k/.',
    },
    {
      id: 'onset-g-gh',
      name: 'Âm đầu g / gh',
      targetSkill: 'sound_symbol',
      examples: ['ga', 'gà', 'ghế', 'ghi'],
      contrastSets: [['ga', 'ghế'], ['gà', 'ghi']],
      caregiverFocus: 'Gắn với quy tắc đi cùng e, ê, i sau khi trẻ nhận diện được chữ.',
    },
    {
      id: 'onset-ng-ngh',
      name: 'Âm đầu ng / ngh',
      targetSkill: 'sound_symbol',
      examples: ['nga', 'ngà', 'nghe', 'nghỉ'],
      contrastSets: [['nga', 'nghe'], ['ngà', 'nghỉ']],
      caregiverFocus: 'Đọc chậm cụm chữ đầu vì đây là âm đầu gồm nhiều chữ cái.',
    },
  ] satisfies SkillCluster[],
  rimeConfusions: [
    {
      id: 'rime-an-ang',
      name: 'Vần an / ang',
      targetSkill: 'syllable_blending',
      examples: ['ban', 'bang', 'lan', 'lang'],
      contrastSets: [['ban', 'bang'], ['lan', 'lang']],
      caregiverFocus: 'Nhấn âm cuối /n/ và /ng/ bằng cặp từ ngắn.',
    },
    {
      id: 'rime-an-breve-an-circumflex',
      name: 'Vần ăn / ân',
      targetSkill: 'syllable_blending',
      examples: ['ăn', 'ân', 'căn', 'cân'],
      contrastSets: [['ăn', 'ân'], ['căn', 'cân']],
      caregiverFocus: 'Cho trẻ nhìn kỹ dấu phụ trên nguyên âm trước khi ghép tiếng.',
    },
    {
      id: 'rime-uon-uoon',
      name: 'Vần ươn / uôn',
      targetSkill: 'syllable_blending',
      examples: ['vườn', 'buồn', 'lượn', 'luôn'],
      contrastSets: [['vườn', 'buồn'], ['lượn', 'luôn']],
      caregiverFocus: 'Tập ghép chậm từng phần vì hai vần có nhiều chữ cái.',
    },
    {
      id: 'rime-ai-ay',
      name: 'Vần ai / ay',
      targetSkill: 'syllable_blending',
      examples: ['mai', 'may', 'tai', 'tay'],
      contrastSets: [['mai', 'may'], ['tai', 'tay']],
      caregiverFocus: 'Để trẻ chỉ vào phần vần và đọc thành tiếng sau cùng.',
    },
    {
      id: 'rime-ao-au',
      name: 'Vần ao / au',
      targetSkill: 'syllable_blending',
      examples: ['sao', 'sau', 'cao', 'cau'],
      contrastSets: [['sao', 'sau'], ['cao', 'cau']],
      caregiverFocus: 'So sánh vị trí chữ cuối trong vần trước khi đọc nhanh.',
    },
    {
      id: 'rime-inh-anh',
      name: 'Vần inh / anh',
      targetSkill: 'syllable_blending',
      examples: ['xinh', 'xanh', 'minh', 'manh'],
      contrastSets: [['xinh', 'xanh'], ['minh', 'manh']],
      caregiverFocus: 'Chia vần thành cụm chữ nhìn được, không yêu cầu trẻ đọc quá nhanh.',
    },
  ] satisfies SkillCluster[],
  spellingRules: [
    {
      id: 'rule-ng-ngh',
      name: 'Quy tắc ng / ngh',
      targetSkill: 'vietnamese_spelling_rule',
      graphemes: ['ng', 'ngh'],
      examples: ['nga', 'ngô', 'nghe', 'nghỉ'],
      ruleHint: 'ngh thường đứng trước e, ê, i; ng dùng trong các trường hợp còn lại.',
      caregiverFocus: 'Cho trẻ chọn chữ đầu theo nguyên âm đứng sau.',
    },
    {
      id: 'rule-g-gh',
      name: 'Quy tắc g / gh',
      targetSkill: 'vietnamese_spelling_rule',
      graphemes: ['g', 'gh'],
      examples: ['ga', 'gò', 'ghế', 'ghi'],
      ruleHint: 'gh thường đứng trước e, ê, i; g dùng trong các trường hợp còn lại.',
      caregiverFocus: 'Nối quy tắc với ví dụ ngắn, không học thuộc dài dòng.',
    },
    {
      id: 'rule-c-k-q',
      name: 'Quy tắc c / k / q',
      targetSkill: 'vietnamese_spelling_rule',
      graphemes: ['c', 'k', 'q'],
      examples: ['ca', 'cô', 'kẻ', 'qua'],
      ruleHint: 'k thường đi trước e, ê, i; q thường đi với u; c dùng trong nhiều trường hợp còn lại.',
      caregiverFocus: 'So sánh chữ sau âm đầu để chọn cách viết phù hợp.',
    },
    {
      id: 'rule-i-y',
      name: 'Quy tắc i / y',
      targetSkill: 'vietnamese_spelling_rule',
      graphemes: ['i', 'y'],
      examples: ['tin', 'tý', 'mì', 'mỹ'],
      ruleHint: 'i và y có cách dùng phụ thuộc tiếng, vị trí và thói quen chính tả.',
      caregiverFocus: 'Ưu tiên nhận diện từ thường gặp, không biến bài đọc thành bài kiểm tra chính tả.',
    },
  ] satisfies SpellingRuleCluster[],
  suggestedFoundationOrder: [
    'tone_discrimination',
    'sound_symbol',
    'syllable_blending',
    'vietnamese_spelling_rule',
    'word_reading',
    'sentence_fluency',
    'comprehension',
  ] satisfies LiteracySkill[],
};

export type SkillTree = typeof skillTree;
