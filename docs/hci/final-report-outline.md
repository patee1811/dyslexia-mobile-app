# Final Report Outline

## 1. Giới thiệu bài toán

- Trẻ có khó khăn đọc cần môi trường luyện ngắn, rõ, ít áp lực.
- Phụ huynh/giáo viên cần biết nên hỗ trợ kỹ năng nào tiếp theo.
- App được xây dựng như công cụ hỗ trợ luyện đọc, không phải công cụ chẩn đoán.

## 2. Người dùng mục tiêu

- Trẻ 7-10 tuổi có khó khăn khi đọc.
- Phụ huynh hỗ trợ luyện ở nhà.
- Giáo viên theo dõi và gợi ý bài luyện nếu có.

## 3. Nghiên cứu nhu cầu

- Phỏng vấn/quan sát phụ huynh, trẻ hoặc người dùng đại diện.
- Tổng hợp nhu cầu: chữ dễ đọc, nghe lại từ/câu, bài ngắn, dashboard hành động.
- Ràng buộc đạo đức: không gắn nhãn trẻ, không thu dữ liệu quá mức.

## 4. Persona và scenario

- Tham chiếu `docs/hci/persona.md`.
- Tham chiếu `docs/hci/scenario.md`.
- Nêu cách persona/scenario ảnh hưởng đến quyết định thiết kế.

## 5. Thiết kế HCI

- Một màn hình tập trung vào một nhiệm vụ chính.
- Phản hồi rõ, nhẹ nhàng, không dùng từ “yếu/kém”.
- Dashboard phụ huynh gồm kỹ năng cần luyện, lỗi lặp lại, bài nên học tiếp, tiến bộ tuần này và ghi chú.
- Tạo bài tùy chỉnh có validator để tránh bài quá dài/quá khó.

## 6. Công nghệ nổi bật: TTS + adaptive interaction + analytics

- TTS giúp trẻ nghe lại từ/câu.
- Adaptive interaction gợi ý bài tiếp theo dựa trên tiến độ và từ cần ôn.
- Analytics nội bộ hỗ trợ dashboard, không dùng để chẩn đoán.

## 7. Kiến trúc app

- React Native screens: Home, Reading Practice, Caregiver, HCI, Settings.
- AppModel quản lý hồ sơ, bài học, lịch sử và ghi chú.
- Caregiver components hiển thị dữ liệu hỗ trợ.
- `src/lib/customLesson.ts` kiểm tra bài tùy chỉnh.

## 8. Demo chức năng

1. Chọn hồ sơ trẻ.
2. Bắt đầu bài luyện.
3. Nghe lại từ/câu.
4. Hoàn thành câu hỏi.
5. Mở dashboard phụ huynh.
6. Xem bài gợi ý tiếp theo.
7. Tạo bài luyện ngắn và xem validator.

## 9. Usability test

- Kế hoạch test 5-10 người.
- Task chính: chọn hồ sơ, bắt đầu bài, nghe lại, hoàn thành câu hỏi, xem dashboard, tìm bài gợi ý.
- Metric: completion rate, lỗi thao tác, thời gian, dễ dùng 1-5, dễ đọc 1-5, thoải mái 1-5.

## 10. Kết quả và cải tiến

- Nếu đã test: trình bày bảng kết quả và issue ưu tiên.
- Nếu chưa test: trình bày kế hoạch chạy test và form quan sát.
- Nêu cải tiến dự kiến sau test.

## 11. Giới hạn: app hỗ trợ, không chẩn đoán

- App không kết luận trẻ bị dyslexia nặng/nhẹ.
- App không thay thế giáo viên chuyên biệt, nhà tâm lý học hoặc chuyên gia âm ngữ trị liệu.
- Dữ liệu chỉ dùng để hỗ trợ luyện đọc và trao đổi với người lớn đồng hành.
