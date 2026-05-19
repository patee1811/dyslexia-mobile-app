import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    style?: ViewStyle;
    testID?: string;
};

export default function Card({ title, subtitle, children, style, testID }: Props) {
    return (
        <View testID={testID} style={[styles.card, style]}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.line,
        padding: 16,
        gap: 10,
    },
    title: {
        color: colors.ink,
        fontSize: 18,
        fontWeight: '800',
    },
    subtitle: {
        color: colors.mutedText,
        fontSize: 14,
        lineHeight: 20,
    },
});
