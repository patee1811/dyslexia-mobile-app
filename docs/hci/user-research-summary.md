# User Research Summary

## Mục tiêu nghiên cứu

Tài liệu này tổng hợp nhu cầu người dùng cho ứng dụng hỗ trợ trẻ có khó khăn đọc/dyslexia luyện đọc tiếng Việt. App được định vị là công cụ hỗ trợ luyện đọc tại nhà/lớp học, không dùng để chẩn đoán hay thay thế chuyên gia.

## Nhóm người dùng mục tiêu

| Nhóm | Nhu cầu chính | Rủi ro cần tránh |
| --- | --- | --- |
| Trẻ 7-10 tuổi có khó khăn đọc | Bài ngắn, chữ dễ đọc, nghe lại từ/câu, phản hồi nhẹ nhàng | Quá tải chữ, bị gắn nhãn yếu/kém, timer gây áp lực |
| Phụ huynh | Biết con cần luyện kỹ năng nào, lỗi nào lặp lại, bài nên học tiếp | Báo cáo dài, thuật ngữ chuyên môn khó hiểu |
| Giáo viên/người hỗ trợ | Có dữ liệu tham khảo để gợi ý bài luyện ngắn | Dùng app như công cụ kết luận năng lực/chẩn đoán |

## Câu hỏi nghiên cứu

1. Trẻ gặp khó khăn ở bước nào khi đọc tiếng Việt: âm đầu, vần, dấu thanh, đọc câu hay hiểu bài?
2. Giao diện nào giúp trẻ tập trung mà không làm trẻ thấy bị kiểm tra?
3. Phụ huynh cần loại báo cáo nào để hỗ trợ con trong 5-10 phút mỗi ngày?
4. App cần lưu dữ liệu gì để gợi ý bài tiếp theo nhưng vẫn hạn chế dữ liệu nhạy cảm?

## Insight chính

- Trẻ cần luồng từng bước, mỗi màn chỉ có một nhiệm vụ chính.
- TTS và nghe lại từng từ/câu là hỗ trợ quan trọng vì trẻ có thể tự kiểm tra trước khi nhờ người lớn.
- Focus line, super focus và word focus giúp giảm nhiễu thị giác khi đọc câu.
- Phụ huynh cần dashboard hành động: kỹ năng cần luyện, lỗi lặp lại, bài nên học tiếp và ghi chú.
- Với tiếng Việt, học liệu cần ưu tiên dấu thanh, âm đầu dễ nhầm, vần dễ nhầm và quy tắc chính tả.

## Quyết định thiết kế rút ra

| Nhu cầu | Quyết định trong app | Nơi triển khai |
| --- | --- | --- |
| Giảm tải nhận thức | Màn luyện đọc chia thành các step nhỏ | `ReadingPracticeScreen`, `src/components/practice/*` |
| Nghe mẫu | TTS cho từ/câu, fallback system TTS khi thiếu Azure | `src/lib/tts.ts`, `AppModel` |
| Tập trung thị giác | Focus line, super focus, word focus | `FocusedSentence.tsx` |
| Cá nhân hóa | Ghi PracticeAnswer, tính metrics, mastery, recommendation | `src/lib/progress.ts`, `src/lib/mastery.ts`, `src/lib/adaptive.ts` |
| Phụ huynh cần hành động cụ thể | Dashboard kỹ năng, lỗi, bài gợi ý, ghi chú | `CaregiverScreen.tsx`, `src/components/caregiver/*` |
| Đạo đức dữ liệu | Privacy screen, xóa dữ liệu local, không chẩn đoán | `PrivacyScreen.tsx`, `src/lib/privacy.ts` |

## Giới hạn hiện tại

- Tài liệu này là tổng hợp nghiên cứu nhu cầu và giả định thiết kế ban đầu.
- Nhóm vẫn cần chạy usability test 5-10 người và cập nhật kết quả vào `docs/hci/usability-test-results.md`.
- Không thu tên thật hoặc dữ liệu nhạy cảm của trẻ nếu không cần thiết.

