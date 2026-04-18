# Dyslexia Reading Coach Mobile

Mobile app ho tro tre roi loan doc luyen doc theo buoi ngan, co luu du lieu that va text-to-speech neural tu dich vu ngoai.

## Muc tieu bai tap lon

- Tap trung dung doi tuong: tre can ho tro luyen doc, cung phu huynh va giao vien.
- Bam quy trinh HCI: persona, scenario, thiet ke, phat trien, usability test.
- Co co che tuong tac noi bat: adaptive flow + neural TTS + dashboard theo doi.
- La cong cu ho tro luyen doc, khong phai cong cu chan doan.

## Tinh nang chinh

- Luu du lieu that theo tung ho so (`AsyncStorage`).
- Nhieu ho so tre, lich su buoi hoc, ghi chu phu huynh, bai doc tu them.
- Man luyen doc co:
  - khoi dong tu kho
  - nghe mau tung tu / tung cau
  - focus line + super focus
  - danh dau tu kho
  - cau hoi hieu bai
  - cham nhanh do luu loat + reward
- Man theo doi co bao cao ngan ngay trong app.
- Neu cau hinh Azure TTS: uu tien giong neural ben ngoai.
- Neu thieu key hoac loi mang: fallback ve `expo-speech`.

## Cong nghe

- React Native + Expo + TypeScript
- `@react-native-async-storage/async-storage`
- `expo-av`
- `expo-file-system`
- `expo-speech` (fallback)

## Cau hinh Azure Neural TTS

1. Tao file `.env` o thu muc goc project.
2. Them cac bien:

```env
EXPO_PUBLIC_AZURE_SPEECH_KEY=your_key_here
EXPO_PUBLIC_AZURE_SPEECH_REGION=southeastasia
EXPO_PUBLIC_AZURE_SPEECH_VOICE=vi-VN-HoaiMyNeural
```

3. Khoi dong lai Expo sau khi sua `.env`.

### Luu y bao mat

Ban demo local co the dat key tren client de di nhanh. Neu deploy that, nen dat key o backend/proxy va goi backend tu app, khong de key tren mobile client.

## Chay project

```bash
npm install
npm run start
```

## Kiem tra

```bash
.\node_modules\.bin\tsc.cmd --noEmit
npm run test:logic
```

## Cau truc chinh

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
