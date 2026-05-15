import type { VietnamesePattern } from '../types/literacy';

export type VietnamesePatternType = 'tone' | 'onset' | 'rime' | 'spelling_rule';

export type VietnamesePatternEntry = VietnamesePattern & {
  key: string;
  name: string;
  type: VietnamesePatternType;
  examples: string[];
  contrastSet: string[];
  regionSensitive: boolean;
  notesForCaregiver: string;
};

export const vietnamesePatterns: VietnamesePatternEntry[] = [
  {
    key: 'tone-ngang-sac',
    name: 'Phân biệt thanh ngang và thanh sắc',
    type: 'tone',
    rime: 'a',
    tone: 'sac',
    examples: ['ma', 'má', 'ba', 'bá'],
    contrastSet: ['ma', 'má', 'ba', 'bá'],
    regionSensitive: false,
    notesForCaregiver: 'Cho trẻ nghe tiếng không dấu và tiếng có dấu sắc, sau đó nhìn dấu trước khi đọc.',
  },
  {
    key: 'tone-sac-nang',
    name: 'Phân biệt dấu sắc và dấu nặng',
    type: 'tone',
    rime: 'a',
    tone: 'nang',
    examples: ['nắng', 'nặng', 'lá', 'lạ'],
    contrastSet: ['nắng', 'nặng', 'lá', 'lạ'],
    regionSensitive: false,
    notesForCaregiver: 'Cho trẻ nghe lại và nhìn dấu trước khi đọc nhanh.',
  },
  {
    key: 'tone-huyen-sac',
    name: 'Phân biệt dấu huyền và dấu sắc',
    type: 'tone',
    rime: 'a',
    tone: 'huyen',
    examples: ['bà', 'bá', 'là', 'lá'],
    contrastSet: ['bà', 'bá', 'là', 'lá'],
    regionSensitive: false,
    notesForCaregiver: 'Đọc mẫu bằng nhịp chậm để trẻ nhận ra hướng đi của dấu.',
  },
  {
    key: 'tone-hoi-nga',
    name: 'Phân biệt dấu hỏi và dấu ngã',
    type: 'tone',
    rime: 'a',
    tone: 'hoi',
    examples: ['mả', 'mã', 'bả', 'bã'],
    contrastSet: ['mả', 'mã', 'bả', 'bã'],
    regionSensitive: true,
    notesForCaregiver: 'Một số vùng phát âm gần nhau; ưu tiên nhận diện dấu trên mặt chữ.',
  },
  {
    key: 'onset-l-n',
    name: 'Phân biệt âm đầu l và n',
    type: 'onset',
    onset: 'l/n',
    graphemes: ['l', 'n'],
    examples: ['lá', 'ná', 'lan', 'nan'],
    contrastSet: ['lá', 'ná', 'lan', 'nan'],
    regionSensitive: true,
    notesForCaregiver: 'Nhắc trẻ chỉ vào chữ đầu trước khi đọc cả tiếng.',
  },
  {
    key: 'onset-ch-tr',
    name: 'Phân biệt âm đầu ch và tr',
    type: 'onset',
    onset: 'ch/tr',
    graphemes: ['ch', 'tr'],
    examples: ['cha', 'tra', 'chơi', 'trời'],
    contrastSet: ['cha', 'tra', 'chơi', 'trời'],
    regionSensitive: true,
    notesForCaregiver: 'Dùng cặp từ ngắn để trẻ so sánh chữ đầu mà không quá tải.',
  },
  {
    key: 'onset-s-x',
    name: 'Phân biệt âm đầu s và x',
    type: 'onset',
    onset: 's/x',
    graphemes: ['s', 'x'],
    examples: ['sao', 'xao', 'sinh', 'xinh'],
    contrastSet: ['sao', 'xao', 'sinh', 'xinh'],
    regionSensitive: true,
    notesForCaregiver: 'Đọc chậm theo cặp và cho trẻ khoanh chữ đầu dễ nhầm.',
  },
  {
    key: 'onset-d-gi-r',
    name: 'Phân biệt âm đầu d, gi và r',
    type: 'onset',
    onset: 'd/gi/r',
    graphemes: ['d', 'gi', 'r'],
    examples: ['da', 'gia', 'ra', 'dạo', 'rạo'],
    contrastSet: ['da', 'gia', 'ra', 'dạo', 'rạo'],
    regionSensitive: true,
    notesForCaregiver: 'Do khác biệt vùng miền, bài này tập trung vào mặt chữ và lựa chọn đúng.',
  },
  {
    key: 'rime-an-ang',
    name: 'Phân biệt vần an và ang',
    type: 'rime',
    rime: 'an/ang',
    examples: ['ban', 'bang', 'lan', 'lang'],
    contrastSet: ['ban', 'bang', 'lan', 'lang'],
    regionSensitive: true,
    notesForCaregiver: 'Nhấn sự khác nhau ở âm cuối n và ng bằng các tiếng ngắn.',
  },
  {
    key: 'rime-an-breve-an-circumflex',
    name: 'Phân biệt vần ăn và ân',
    type: 'rime',
    rime: 'ăn/ân',
    examples: ['ăn', 'ân', 'căn', 'cân'],
    contrastSet: ['ăn', 'ân', 'căn', 'cân'],
    regionSensitive: false,
    notesForCaregiver: 'Cho trẻ quan sát dấu phụ trên nguyên âm trước khi ghép âm.',
  },
  {
    key: 'rule-ng-ngh',
    name: 'Quy tắc chính tả ng và ngh',
    type: 'spelling_rule',
    graphemes: ['ng', 'ngh'],
    examples: ['nga', 'ngô', 'nghe', 'nghỉ'],
    contrastSet: ['nga', 'nghe', 'ngô', 'nghỉ'],
    regionSensitive: false,
    notesForCaregiver: 'Nêu quy tắc bằng ví dụ: ngh thường đi trước e, ê, i.',
  },
  {
    key: 'rule-c-k-q',
    name: 'Quy tắc chính tả c, k và q',
    type: 'spelling_rule',
    graphemes: ['c', 'k', 'q'],
    examples: ['ca', 'cô', 'kẻ', 'qua'],
    contrastSet: ['ca', 'kẻ', 'qua'],
    regionSensitive: false,
    notesForCaregiver: 'Nhìn chữ đứng sau âm đầu để chọn cách ghi phù hợp.',
  },
];
