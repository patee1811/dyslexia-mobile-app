import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { useAppModel } from '../../context/AppModel';
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

        if (value === 'female') {
            setAzureVoice('vi-VN-HoaiMyNeural');
        }

        if (value === 'male') {
            setAzureVoice('vi-VN-NamMinhNeural');
        }
    };

    return (
        <View style={[styles.panel, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }, style]}>
            <Text style={[styles.title, { color: currentTheme.text }]}>Cai dat doc</Text>
            <Text style={[styles.helper, { color: currentTheme.subtext }]}>Chon kieu hien thi de doc nhat voi con.</Text>

            <SettingGroup
                title="Co chu"
                description="Giup tre thay chu ro rang hon."
                options={FONT_SCALE_OPTIONS}
                value={preferences.fontScale}
                onChange={(next) => updatePreference('fontScale', next)}
                theme={currentTheme}
            />

            <SettingGroup
                title="Khoang cach dong"
                description="Rong dong giup mat de theo doi."
                options={LINE_SPACING_OPTIONS}
                value={preferences.lineSpacing}
                onChange={(next) => updatePreference('lineSpacing', next)}
                theme={currentTheme}
            />

            <SettingGroup
                title="Khoang cach chu"
                description="Tang khoang cach de giam nhiu mat."
                options={LETTER_SPACING_OPTIONS}
                value={preferences.letterSpacing}
                onChange={(next) => updatePreference('letterSpacing', next)}
                theme={currentTheme}
            />

            <ToggleRow
                title="Focus line"
                description="Lam noi bat dong dang doc."
                value={preferences.focusMode}
                onChange={(next) => updatePreference('focusMode', next)}
                theme={currentTheme}
            />

            <ToggleRow
                title="Cloud TTS"
                description="Bat de dung giong doc tren cloud khi co mang."
                value={allowCloud}
                onChange={(next) => updatePreference('allowCloud', next)}
                theme={currentTheme}
            />

            <SettingGroup
                title="Giong doc"
                description={allowCloud ? 'Chon giong doc phu hop voi tre.' : 'Dang dung giong he thong vi Cloud TTS dang tat.'}
                options={VOICE_MODE_OPTIONS}
                value={allowCloud ? voiceMode : 'system'}
                onChange={handleVoiceMode}
                theme={currentTheme}
                disabled={!allowCloud}
            />

            <SettingGroup
                title="Toc do doc"
                description="Chon toc do de tre nghe ro tung tu."
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
                    label="Bat"
                    selected={value}
                    onPress={() => onChange(true)}
                    theme={theme}
                    accessibilityLabel={`${title}: Bat`}
                />
                <OptionButton
                    label="Tat"
                    selected={!value}
                    onPress={() => onChange(false)}
                    theme={theme}
                    accessibilityLabel={`${title}: Tat`}
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
