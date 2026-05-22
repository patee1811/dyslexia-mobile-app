import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import SectionCard from '../components/SectionCard';
import { useAppModel } from '../context/AppModel';
import { hciChecklistGroups } from '../data/content';

export default function HciScreen() {
  const { currentTheme, activeRecord } = useAppModel();

  return (
    <ScrollView style={{ backgroundColor: currentTheme.background }} contentContainerStyle={styles.content}>
      <SectionCard
        title="Liên kết với yêu cầu bài tập lớn"
        subtitle="App hiện đã có lưu dữ liệu cục bộ, đa hồ sơ, adaptive interaction, text-to-speech và báo cáo ngắn trong ứng dụng."
        style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
      >
        <Text style={[styles.body, { color: currentTheme.text }]}>
          1. Đối tượng cụ thể: trẻ 7-10 tuổi cần hỗ trợ luyện đọc, cùng phụ huynh và giáo viên theo dõi.
        </Text>
        <Text style={[styles.body, { color: currentTheme.text }]}>
          2. Quy trình HCI: nghiên cứu nhu cầu, persona, scenario, thiết kế luồng, phát triển app và usability test.
        </Text>
        <Text style={[styles.body, { color: currentTheme.text }]}>
          3. Cơ chế nổi bật: adaptive interaction, text-to-speech, lưu cục bộ theo hồ sơ và analytics mức cơ bản.
        </Text>
        <Text style={[styles.body, { color: currentTheme.accent }]}>
          4. Phạm vi an toàn: chỉ hỗ trợ luyện đọc, không tuyên bố chẩn đoán hay can thiệp chuyên môn.
        </Text>
      </SectionCard>

      <SectionCard title="Minh chứng HCI cần nộp" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        <Text style={[styles.body, { color: currentTheme.text }]}>
          • Nghiên cứu nhu cầu: `docs/hci/user-research-summary.md`.
        </Text>
        <Text style={[styles.body, { color: currentTheme.text }]}>
          • Persona/scenario: `docs/hci/persona.md` và `docs/hci/scenario.md`.
        </Text>
        <Text style={[styles.body, { color: currentTheme.text }]}>
          • Kế hoạch/form test: `docs/hci/usability-test-plan.md` và `docs/hci/usability-test-form.md`.
        </Text>
        <Text style={[styles.body, { color: currentTheme.accent }]}>
          • Kết quả test cần điền sau khi chạy 5-10 người: `docs/hci/usability-test-results.md`.
        </Text>
      </SectionCard>

      <SectionCard title="Persona và scenario đang dùng" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        <View style={styles.block}>
          <Text style={[styles.heading, { color: currentTheme.text }]}>Persona đang mở</Text>
          <Text style={[styles.body, { color: currentTheme.subtext }]}>
            {activeRecord.profile.name}, {activeRecord.profile.age} tuổi, mức đọc: {activeRecord.profile.readingLevel}.
          </Text>
        </View>
        <View style={styles.block}>
          <Text style={[styles.heading, { color: currentTheme.text }]}>Scenario</Text>
          <Text style={[styles.body, { color: currentTheme.subtext }]}>
            Phụ huynh mở app, chọn hồ sơ, nghe mẫu từ/câu, cho trẻ đọc từng câu, đánh dấu từ khó, trả lời câu hỏi ngắn và xem báo cáo sau buổi học.
          </Text>
        </View>
      </SectionCard>

      {hciChecklistGroups.map((group) => (
        <SectionCard key={group.title} title={group.title} style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
          {group.items.map((item) => (
            <Text key={item} style={[styles.body, { color: currentTheme.text }]}>{`• ${item}`}</Text>
          ))}
        </SectionCard>
      ))}

      <SectionCard title="Các cải tiến mới để nêu trong báo cáo" style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}>
        <Text style={[styles.body, { color: currentTheme.text }]}>
          • `AsyncStorage`: lưu dữ liệu thật, giúp app phản ánh bối cảnh sử dụng dài hạn thay vì demo tạm thời.
        </Text>
        <Text style={[styles.body, { color: currentTheme.text }]}>
          • `expo-speech`: hỗ trợ multimodal interaction bằng âm thanh cho từ và câu.
        </Text>
        <Text style={[styles.body, { color: currentTheme.text }]}>
          • Onboarding, reward và siêu tập trung: tăng khả năng học liên tục và giảm mệt mỏi nhận thức.
        </Text>
        <Text style={[styles.body, { color: currentTheme.text }]}>
          • Báo cáo ngắn ngay trong app: phù hợp với phụ huynh và giáo viên có ít thời gian.
        </Text>
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  block: {
    gap: 4,
  },
  heading: {
    fontSize: 18,
    fontWeight: '800',
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
  },
});
