import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
    total: number;
    activeIndex: number;
    size?: number;
    activeColor?: string;
    inactiveColor?: string;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    style?: ViewStyle;
};

export default function ProgressDots({
    total,
    activeIndex,
    size = 10,
    activeColor = colors.accent,
    inactiveColor = colors.line,
    accessibilityLabel,
    accessibilityHint,
    style,
}: Props) {
    const safeTotal = Math.max(0, Math.floor(total));
    const safeIndex = safeTotal > 0 ? Math.min(Math.max(activeIndex, 0), safeTotal - 1) : 0;
    const label = accessibilityLabel ??
        (safeTotal > 0 ? `Progress ${safeIndex + 1} of ${safeTotal}` : 'Progress');

    return (
        <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={label}
            accessibilityHint={accessibilityHint}
            accessibilityValue={
                safeTotal > 0
                    ? {
                        min: 1,
                        max: safeTotal,
                        now: safeIndex + 1,
                    }
                    : undefined
            }
            style={[styles.container, style]}
        >
            {Array.from({ length: safeTotal }).map((_, index) => {
                const isActive = index === safeIndex;

                return (
                    <View
                        key={`dot-${index}`}
                        style={[
                            styles.dot,
                            { width: size, height: size, borderRadius: size / 2 },
                            { backgroundColor: isActive ? activeColor : inactiveColor },
                            index !== safeTotal - 1 && styles.dotSpacing,
                        ]}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        opacity: 0.95,
    },
    dotSpacing: {
        marginRight: 6,
    },
});
