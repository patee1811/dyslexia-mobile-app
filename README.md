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
  - nghe viết/chính tả theo quy tắc tiếng Việt
  - nối từ với tranh/nghĩa
  - kể lại câu chuyện ngắn bằng lời của trẻ
  - ôn lỗi cá nhân hóa theo từ/vần/dấu trẻ hay gặp
  - focus line + super focus
  - word focus: chạm từng từ để làm nổi bật và nghe mẫu
  - đánh dấu từ khó
  - câu hỏi hiểu bài
  - chấm nhanh độ lưu loát + reward
- Màn theo dõi có báo cáo ngắn ngay trong app.
- Có backend prototype cho Google OAuth.
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
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000
```

3. Khởi động lại Expo sau khi sửa `.env`.

### Lưu ý bảo mật

Bản demo local có thể đặt key trên client để đi nhanh. Nếu deploy thật, nên đặt key ở backend/proxy và gọi backend từ app, không để key trên mobile client.

## Backend và Google OAuth

Backend prototype dùng Node.js built-in HTTP server, không cần package ngoài.

1. Tạo OAuth Client trong Google Cloud Console, loại Web application.
2. Thêm redirect URI:

```text
http://localhost:4000/api/auth/google/callback
```

3. Chạy backend với biến môi trường:

```powershell
$env:GOOGLE_CLIENT_ID="your_google_client_id"
$env:GOOGLE_CLIENT_SECRET="your_google_client_secret"
$env:FRONTEND_ORIGIN="http://localhost:8081"
$env:BACKEND_PUBLIC_URL="http://localhost:4000"
$env:GOOGLE_REDIRECT_URI="http://localhost:4000/api/auth/google/callback"
npm.cmd run backend
```

4. Ở terminal khác chạy app:

```powershell
$env:EXPO_PUBLIC_API_BASE_URL="http://localhost:4000"
npm.cmd run web
```

Nếu backend hoặc OAuth chưa cấu hình, màn đăng nhập vẫn có nút `Tiếp tục demo offline` để demo app không bị chặn.

## Chạy project

```bash
npm install
npm run start
```

Chạy backend:

```bash
npm run backend
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
