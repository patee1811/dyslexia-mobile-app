type ButtonA11yInput = {
    label: string;
    hint?: string;
    selected?: boolean;
    disabled?: boolean;
};

export function getButtonA11yProps({ label, hint, selected, disabled }: ButtonA11yInput) {
    return {
        accessible: true,
        accessibilityRole: 'button' as const,
        accessibilityLabel: label,
        accessibilityHint: hint,
        accessibilityState: {
            selected,
            disabled,
        },
    };
}
