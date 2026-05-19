import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '../components/common/PrimaryButton';
import SectionCard from '../components/SectionCard';
import { useAppModel } from '../context/AppModel';
import { deleteAllLocalData, deleteChildData } from '../lib/privacy';

export default function PrivacyScreen() {
    const { activeRecord, currentTheme } = useAppModel();
    const childName = activeRecord.profile.name;
    const childId = activeRecord.profile.id;

    const handleDeleteChild = async () => {
        await deleteChildData(childId);
        Alert.alert('Đã xóa dữ liệu', `Dữ liệu của ${childName} đã được xóa.`);
    };

    const handleDeleteAll = async () => {
        await deleteAllLocalData();
        Alert.alert('Đã xóa dữ liệu', 'Tất cả dữ liệu đã được xóa khỏi thiết bị.');
    };

    const confirmDeleteChild = () => {
        Alert.alert('Xóa dữ liệu của bé', `Bạn có chắc muốn xóa dữ liệu của ${childName}?`, [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Xóa', style: 'destructive', onPress: () => void handleDeleteChild() },
        ]);
    };

    const confirmDeleteAll = () => {
        Alert.alert('Xóa toàn bộ dữ liệu', 'Bạn có chắc muốn xóa toàn bộ dữ liệu trên thiết bị?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Xóa hết', style: 'destructive', onPress: () => void handleDeleteAll() },
        ]);
    };

    return (
        <ScrollView style={{ backgroundColor: currentTheme.background }} contentContainerStyle={styles.content}>
            <SectionCard
                title="Quyền riêng tư"
                subtitle="Thông tin ngắn gọn để phụ huynh dễ theo dõi."
                style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
            >
                <Text style={[styles.lead, { color: currentTheme.text }]}>{childName}</Text>
                <Text style={[styles.note, { color: currentTheme.subtext }]}>Bạn có thể xóa dữ liệu theo từng hồ sơ.</Text>
            </SectionCard>

            <SectionCard
                title="Ứng dụng lưu dữ liệu nào cục bộ?"
                subtitle="Tên của bé và lịch sử đọc."
                style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
            >
                <View style={styles.list}>
                    <Text style={[styles.bullet, { color: currentTheme.text }]}>• Tên của bé</Text>
                    <Text style={[styles.bullet, { color: currentTheme.text }]}>• Lịch sử đọc và tiến trình buổi học</Text>
                </View>
            </SectionCard>

            <SectionCard
                title="Dữ liệu được lưu ở đâu?"
                subtitle="An toàn trên thiết bị của bạn."
                style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
            >
                <Text style={[styles.note, { color: currentTheme.subtext }]}>Dữ liệu không tự động gửi đi khi không có sự đồng ý.</Text>
            </SectionCard>

            <SectionCard
                title="Khi nào âm thanh được gửi lên đám mây?"
                subtitle="Khi bật tính năng Luyện đọc với giọng mẫu Azure Neural."
                style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
            >
                <Text style={[styles.note, { color: currentTheme.subtext }]}>Bạn có thể tắt Cloud TTS trong phần cài đặt đọc.</Text>
            </SectionCard>

            <SectionCard
                title="Xóa dữ liệu"
                subtitle="Vui lòng xác nhận trước khi xóa."
                style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
            >
                <View style={styles.actions}>
                    <PrimaryButton
                        label={`Xóa dữ liệu của ${childName}`}
                        onPress={confirmDeleteChild}
                        accessibilityHint="Xóa toàn bộ tiến trình của bé trên thiết bị"
                    />
                    <PrimaryButton
                        label="Xóa toàn bộ dữ liệu"
                        onPress={confirmDeleteAll}
                        accessibilityHint="Xóa tất cả dữ liệu của ứng dụng"
                    />
                </View>
            </SectionCard>

            <SectionCard
                title="Lưu ý quan trọng"
                subtitle="Ứng dụng là công cụ hỗ trợ."
                style={{ backgroundColor: currentTheme.surface, borderColor: currentTheme.border }}
            >
                <Text style={[styles.note, { color: currentTheme.subtext }]}>
                    Ứng dụng là công cụ hỗ trợ luyện đọc giải trí, không có chức năng chẩn đoán y khoa hoặc thay thế các liệu
                    pháp can thiệp chuyên môn.
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
    lead: {
        fontSize: 22,
        fontWeight: '800',
    },
    note: {
        fontSize: 14,
        lineHeight: 21,
    },
    list: {
        gap: 6,
    },
    bullet: {
        fontSize: 15,
        lineHeight: 22,
    },
    actions: {
        gap: 10,
    },
});
