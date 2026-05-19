import React from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

type Props = {
    children: React.ReactNode;
    scroll?: boolean;
    style?: ViewStyle;
    contentStyle?: ViewStyle;
    testID?: string;
};

export default function ScreenContainer({
    children,
    scroll = true,
    style,
    contentStyle,
    testID,
}: Props) {
    if (!scroll) {
        return (
            <View testID={testID} style={[styles.screen, style, contentStyle]}>
                {children}
            </View>
        );
    }

    return (
        <ScrollView
            testID={testID}
            style={[styles.screen, style]}
            contentContainerStyle={[styles.content, contentStyle]}
            keyboardShouldPersistTaps="handled"
        >
            {children}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.appBackground,
    },
    content: {
        padding: 16,
        gap: 16,
        paddingBottom: 32,
    },
});
