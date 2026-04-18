# Dyslexia Reading Coach Mobile

Ứng dụng di động hỗ trợ trẻ rối loạn đọc luyện đọc theo các buổi ngắn, có lưu dữ liệu thật và dùng neural text-to-speech từ dịch vụ ngoài.

## Mục tiêu bài tập lớn

- Tập trung đúng đối tượng: trẻ cần hỗ trợ luyện đọc, cùng phụ huynh và giáo viên.
- Bám quy trình HCI: persona, scenario, thiết kế, phát triển, usability test.
- Có cơ chế tương tác nổi bật: adaptive flow + neural TTS + dashboard theo dõi.
- Là công cụ hỗ trợ luyện đọc, không phải công cụ chẩn đoán.

## Tính năng chính

- Lưu dữ liệu thật theo từng hồ sơ (`AsyncStorage`).
- Nhiều hồ sơ trẻ, lịch sử buổi học, ghi chú phụ huynh, bài đọc tự thêm.
- Màn luyện đọc có:
  - khởi động từ khó
  - nghe mẫu từng từ / từng câu
  - focus line + super focus
  - đánh dấu từ khó
  - câu hỏi hiểu bài
  - chấm nhanh độ lưu loát + reward
- Màn theo dõi có báo cáo ngắn ngay trong app.
- Nếu cấu hình Azure TTS: ưu tiên giọng neural bên ngoài.
- Nếu thiếu key hoặc lỗi mạng: fallback về `expo-speech`.

## Công nghệ

- React Native + Expo + TypeScript
- `@react-native-async-storage/async-storage`
- `expo-av`
- `expo-file-system`
- `expo-speech` (fallback)

## Cấu hình Azure Neural TTS

1. Tạo file `.env` ở thư mục gốc project.
2. Thêm các biến:

```env
EXPO_PUBLIC_AZURE_SPEECH_KEY=your_key_here
EXPO_PUBLIC_AZURE_SPEECH_REGION=southeastasia
EXPO_PUBLIC_AZURE_SPEECH_VOICE=vi-VN-HoaiMyNeural
```

3. Khởi động lại Expo sau khi sửa `.env`.

### Lưu ý bảo mật

Bản demo local có thể đặt key trên client để đi nhanh. Nếu deploy thật, nên đặt key ở backend/proxy và gọi backend từ app, không để key trên mobile client.

## Chạy project

```bash
npm install
npm run start
```

## Kiểm tra

```bash
.\node_modules\.bin\tsc.cmd --noEmit
npm run test:logic
```

## Cấu trúc chính

```text
.
├─ App.tsx
├─ src
│  ├─ components
│  ├─ context
│  ├─ data
│  ├─ lib
│  ├─ screens
│  ├─ theme
│  └─ types.ts
├─ scripts
│  └─ test-coach.ts
└─ docs
   └─ hci
```

## Ghi chú encoding trên Windows

- Repo này dùng UTF-8 và `LF` làm chuẩn mặc định qua `.editorconfig` và `.gitattributes`.
- Nếu xem file trong PowerShell, nên đọc bằng `Get-Content -Encoding utf8 <file>`.
- Nếu terminal vẫn hiển thị sai dấu, kiểm tra lại code page bằng `chcp 65001`.
