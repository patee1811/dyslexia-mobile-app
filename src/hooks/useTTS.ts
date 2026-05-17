import { useCallback, useEffect, useState } from 'react';
import { getTtsState, speak, stop, subscribeTts } from '../lib/tts';

export function useTTS() {
    const initialState = getTtsState();
    const [speaking, setSpeaking] = useState(initialState.isSpeaking);
    const [text, setText] = useState(initialState.activeText);

    useEffect(() => {
        const unsubscribe = subscribeTts((state) => {
            setSpeaking(state.isSpeaking);
            setText(state.activeText);
        });

        return unsubscribe;
    }, []);

    const speakText = useCallback((options: Parameters<typeof speak>[0]) => speak(options), []);
    const stopSpeaking = useCallback(() => stop(), []);

    return {
        speak: speakText,
        stop: stopSpeaking,
        isSpeaking: speaking,
        activeText: text,
    };
}
