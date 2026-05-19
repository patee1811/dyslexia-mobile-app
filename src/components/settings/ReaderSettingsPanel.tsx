import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useAppModel } from '../../context/AppModel';
import { themeOptions } from '../../data/content';
import type { PracticePreferences } from '../../types';
import type { SpeakRate, VoiceMode } from '../../lib/tts';

type ExtendedPreferences = PracticePreferences & {
    allowCloud?: boolean;
    speechRate?: SpeakRate;
    voiceMode?: VoiceMode;
};

type Props = {
    style?: ViewStyle;
};

type Option<T> = {
    label: string;
    value: T;
    hint?: string;
};

const FONT_SCALE_OPTIONS: Option<number>[] = [
    { label: 'Nhỏ', value: 1.0 },
    { label: 'Vừa', value: 1.15, hint: 'Gợi ý' },
    { label: 'Lớn', value: 1.3 },
    { label: 'Rất lớn', value: 1.45 },
];

const LINE_SPACING_OPTIONS: Option<number>[] = [
    { label: 'Gần', value: 1.2 },
    { label: 'Thoải mái', value: 1.35 },
    { label: 'Rộng', value: 1.45, hint: 'Gợi ý' },
    { label: 'Rất rộng', value: 1.6 },
];

const LETTER_SPACING_OPTIONS: Option<number>[] = [
    { label: 'Sát', value: 0 },
    { label: 'Vừa', value: 0.2 },
    { label: 'Dễ nhìn', value: 0.5, hint: 'Gợi ý' },
    { label: 'Rộng', value: 0.8 },
];

const VOICE_MODE_OPTIONS: Option<VoiceMode>[] = [
    { label: 'Giọng nữ', value: 'female' },
    { label: 'Giọng nam', value: 'male' },
    { label: 'Hệ thống', value: 'system' },
];

const RATE_OPTIONS: Option<SpeakRate>[] = [
    { label: 'Rất chậm', value: 'very_slow' },
    { label: 'Chậm', value: 'slow' },
    { label: 'Vừa', value: 'normal' },
];

const THEME_OPTIONS: Option<PracticePreferences['themeId']>[] = themeOptions.map((theme) => ({
    label: theme.name,
    value: theme.id,
}));

export default function ReaderSettingsPanel({ style }: Props) {
    const { activeRecord, updatePreferences, setAzureVoice, currentTheme } = useAppModel();
    const preferences = activeRecord.preferences as ExtendedPreferences;
    const allowCloud = preferences.allowCloud ?? true;
    const voiceMode = preferences.voiceMode ?? 'female';
    const speechRate = preferences.speechRate ?? 'slow';

    const updatePreference = <K extends keyof ExtendedPreferences>(key: K, value: ExtendedPreferences[K]) => {
        updatePreferences((previous) => ({
            ...(previous as ExtendedPreferences),
            [key]: value,
        }) as PracticePreferences);
    };

    const handleVoiceMode = (value: VoiceMode) => {
        updatePreference('voiceMode', value);

        if (value === 'system') {
            updatePreference('allowCloud', false);
            return;
        }

        updatePreference('allowCloud', true);

        if (value === 'female') {
            setAzureVoice('vi-VN-HoaiMyNeural');
        }

        if (value === 'male') {
            setAzureVoice('vi-VN-NamMinhNeural');
        }
    };

    const handleCloudTts = (value: boolean) => {
        updatePreference('allowCloud', value);

        if (value && voiceMode === 'system') {
            handleVoiceMode('female');
        }
    };

    return (
        <View style={[styles.panel, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }, style]}>
            <Text style={[styles.title, { color: currentTheme.text }]}>Cài đặt đọc</Text>
            <Text style={[styles.helper, { color: currentTheme.subtext }]}>Chọn kiểu hiển thị dễ đọc nhất với con.</Text>

            <SettingGroup
                title="Cỡ chữ"
                description="Giúp trẻ thấy chữ rõ hơn."
                options={FONT_SCALE_OPTIONS}
                value={preferences.fontScale}
                onChange={(next) => updatePreference('fontScale', next)}
                theme={currentTheme}
            />

            <SettingGroup
                title="Khoảng dòng"
                description="Dòng rộng giúp mắt dễ theo dõi hơn."
                options={LINE_SPACING_OPTIONS}
                value={preferences.lineSpacing}
                onChange={(next) => updatePreference('lineSpacing', next)}
                theme={currentTheme}
            />

            <SettingGroup
                title="Khoảng chữ"
                description="Tăng khoảng cách để giảm nhiễu thị giác."
                options={LETTER_SPACING_OPTIONS}
                value={preferences.letterSpacing}
                onChange={(next) => updatePreference('letterSpacing', next)}
                theme={currentTheme}
            />

            <SettingGroup
                title="Nền đọc"
                description="Chọn nền dịu, tương phản vừa đủ."
                options={THEME_OPTIONS}
                value={preferences.themeId}
                onChange={(next) => updatePreference('themeId', next)}
                theme={currentTheme}
            />

            <ToggleRow
                title="Focus line"
                description="Làm nổi bật dòng đang đọc."
                value={preferences.focusMode}
                onChange={(next) => updatePreference('focusMode', next)}
                theme={currentTheme}
            />

            <ToggleRow
                title="Super focus"
                description="Làm mờ phần xung quanh câu đang đọc."
                value={preferences.superFocus}
                onChange={(next) => updatePreference('superFocus', next)}
                theme={currentTheme}
            />

            <ToggleRow
                title="Giảm chuyển động"
                description="Giữ giao diện ổn định hơn trong lúc luyện."
                value={preferences.reduceMotion}
                onChange={(next) => updatePreference('reduceMotion', next)}
                theme={currentTheme}
            />

            <ToggleRow
                title="Cloud TTS"
                description="Bật để dùng giọng đọc trên cloud khi có mạng."
                value={allowCloud}
                onChange={handleCloudTts}
                theme={currentTheme}
            />

            <SettingGroup
                title="Giọng đọc"
                description={allowCloud ? 'Chọn giọng đọc phù hợp với trẻ.' : 'Đang dùng giọng hệ thống vì Cloud TTS đang tắt.'}
                options={VOICE_MODE_OPTIONS}
                value={allowCloud ? voiceMode : 'system'}
                onChange={handleVoiceMode}
                theme={currentTheme}
                disabled={!allowCloud}
            />

            <SettingGroup
                title="Tốc độ đọc"
                description="Chọn tốc độ để trẻ nghe rõ từng từ."
                options={RATE_OPTIONS}
                value={speechRate}
                onChange={(next) => updatePreference('speechRate', next)}
                theme={currentTheme}
            />
        </View>
    );
}

type ThemePalette = {
    surface: string;
    surfaceAlt: string;
    accent: string;
    accentSoft: string;
    text: string;
    subtext: string;
    border: string;
};

type SettingGroupProps<T extends string | number> = {
    title: string;
    description: string;
    options: Option<T>[];
    value: T;
    onChange: (value: T) => void;
    theme: ThemePalette;
    disabled?: boolean;
};

function SettingGroup<T extends string | number>({
    title,
    description,
    options,
    value,
    onChange,
    theme,
    disabled = false,
}: SettingGroupProps<T>) {
    return (
        <View style={styles.group}>
            <Text style={[styles.groupTitle, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.groupDesc, { color: theme.subtext }]}>{description}</Text>
            <View style={styles.optionRow}>
                {options.map((option) => {
                    const selected = option.value === value;
                    const optionLabel = option.hint ? `${option.label} (${option.hint})` : option.label;

                    return (
                        <OptionButton
                            key={`${title}-${option.value}`}
                            label={option.label}
                            hint={option.hint}
                            selected={selected}
                            onPress={() => onChange(option.value)}
                            disabled={disabled}
                            theme={theme}
                            accessibilityLabel={`${title}: ${optionLabel}`}
                        />
                    );
                })}
            </View>
        </View>
    );
}

type ToggleRowProps = {
    title: string;
    description: string;
    value: boolean;
    onChange: (value: boolean) => void;
    theme: ThemePalette;
};

function ToggleRow({ title, description, value, onChange, theme }: ToggleRowProps) {
    return (
        <View style={styles.group}>
            <Text style={[styles.groupTitle, { color: theme.text }]}>{title}</Text>
            <Text style={[styles.groupDesc, { color: theme.subtext }]}>{description}</Text>
            <View style={styles.optionRow}>
                <OptionButton
                    label="Bật"
                    selected={value}
                    onPress={() => onChange(true)}
                    theme={theme}
                    accessibilityLabel={`${title}: Bật`}
                />
                <OptionButton
                    label="Tắt"
                    selected={!value}
                    onPress={() => onChange(false)}
                    theme={theme}
                    accessibilityLabel={`${title}: Tắt`}
                />
            </View>
        </View>
    );
}

type OptionButtonProps = {
    label: string;
    selected: boolean;
    onPress: () => void;
    theme: ThemePalette;
    disabled?: boolean;
    hint?: string;
    accessibilityLabel?: string;
};

function OptionButton({
    label,
    selected,
    onPress,
    theme,
    disabled = false,
    hint,
    accessibilityLabel,
}: OptionButtonProps) {
    return (
        <Pressable
            accessible
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityHint={hint}
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            onPress={onPress}
            style={({ pressed }) => [
                styles.option,
                { borderColor: theme.border, backgroundColor: theme.surfaceAlt },
                selected && { borderColor: theme.accent, backgroundColor: theme.accentSoft },
                pressed && !disabled && styles.optionPressed,
                disabled && styles.optionDisabled,
            ]}
        >
            <Text style={[styles.optionLabel, { color: selected ? theme.accent : theme.text }]}>{label}</Text>
            {hint ? <Text style={[styles.optionHint, { color: theme.subtext }]}>{hint}</Text> : null}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    panel: {
        borderWidth: 1,
        borderRadius: 22,
        padding: 16,
        gap: 18,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
    },
    helper: {
        fontSize: 14,
        lineHeight: 20,
    },
    group: {
        gap: 10,
    },
    groupTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    groupDesc: {
        fontSize: 13,
        lineHeight: 18,
    },
    optionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    option: {
        minHeight: 40,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionPressed: {
        opacity: 0.9,
    },
    optionDisabled: {
        opacity: 0.45,
    },
    optionLabel: {
        fontSize: 14,
        fontWeight: '700',
    },
    optionHint: {
        fontSize: 11,
        marginTop: 2,
    },
});
