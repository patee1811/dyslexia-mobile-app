import React from 'react';
import { Pressable, StyleSheet, Text, type TextStyle, type ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    compact?: boolean;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    style?: ViewStyle;
    labelStyle?: TextStyle;
    testID?: string;
};

export default function PrimaryButton({
    label,
    onPress,
    disabled = false,
    compact = false,
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
            accessibilityState={{ disabled }}
            disabled={disabled}
            onPress={onPress}
            testID={testID}
            style={({ pressed }) => [
                styles.button,
                compact && styles.compact,
                pressed && !disabled && styles.pressed,
                disabled && styles.disabled,
                style,
            ]}
        >
            <Text style={[styles.label, labelStyle]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        minHeight: 52,
        paddingHorizontal: 18,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.accent,
    },
    compact: {
        minHeight: 42,
        paddingHorizontal: 14,
    },
    pressed: {
        opacity: 0.9,
    },
    disabled: {
        opacity: 0.5,
    },
    label: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.2,
    },
});
