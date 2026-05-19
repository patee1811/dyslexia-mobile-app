import React from 'react';
import { Pressable, StyleSheet, Text, type TextStyle, type ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
    label: string;
    value: boolean;
    onPress: () => void;
    disabled?: boolean;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    style?: ViewStyle;
    labelStyle?: TextStyle;
    testID?: string;
};

export default function ToggleChip({
    label,
    value,
    onPress,
    disabled = false,
    accessibilityLabel,
    accessibilityHint,
    style,
    labelStyle,
    testID,
}: Props) {
    return (
        <Pressable
            accessible
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityHint={accessibilityHint}
            accessibilityState={{ disabled, selected: value }}
            disabled={disabled}
            onPress={onPress}
            testID={testID}
            style={({ pressed }) => [
                styles.chip,
                value && styles.active,
                pressed && !disabled && styles.pressed,
                disabled && styles.disabled,
                style,
            ]}
        >
            <Text style={[styles.label, value && styles.activeLabel, labelStyle]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    chip: {
        minHeight: 36,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    active: {
        borderColor: colors.accent,
        backgroundColor: colors.accentSoft,
    },
    pressed: {
        opacity: 0.9,
    },
    disabled: {
        opacity: 0.5,
    },
    label: {
        color: colors.ink,
        fontSize: 14,
        fontWeight: '700',
    },
    activeLabel: {
        color: colors.accent,
    },
});
