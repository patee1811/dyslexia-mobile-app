import React from 'react';
import { Pressable, StyleSheet, Text, type TextStyle, type ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
    label: string;
    onPress: () => void;
    selected?: boolean;
    correct?: boolean;
    incorrect?: boolean;
    disabled?: boolean;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    style?: ViewStyle;
    labelStyle?: TextStyle;
    testID?: string;
};

export default function ChoiceButton({
    label,
    onPress,
    selected = false,
    correct = false,
    incorrect = false,
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
            accessibilityState={{ disabled, selected }}
            disabled={disabled}
            onPress={onPress}
            testID={testID}
            style={({ pressed }) => [
                styles.button,
                selected && styles.selected,
                correct && styles.correct,
                incorrect && styles.incorrect,
                pressed && !disabled && styles.pressed,
                disabled && styles.disabled,
                style,
            ]}
        >
            <Text
                style={[
                    styles.label,
                    selected && styles.selectedLabel,
                    (correct || incorrect) && styles.statusLabel,
                    labelStyle,
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        minHeight: 52,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.line,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selected: {
        borderColor: colors.accent,
        backgroundColor: colors.accentSoft,
    },
    correct: {
        borderColor: colors.teal,
        backgroundColor: colors.tealSoft,
    },
    incorrect: {
        borderColor: colors.danger,
        backgroundColor: '#F3C9C2',
    },
    pressed: {
        opacity: 0.9,
    },
    disabled: {
        opacity: 0.5,
    },
    label: {
        color: colors.ink,
        fontSize: 16,
        fontWeight: '700',
        textAlign: 'center',
    },
    selectedLabel: {
        color: colors.accent,
    },
    statusLabel: {
        color: colors.ink,
    },
});
