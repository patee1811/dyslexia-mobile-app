import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { synthesizeAzureSpeechToFile } from './azureTts';

export type SpeakMode = 'word' | 'syllable' | 'sentence';
export type SpeakRate = 'very_slow' | 'slow' | 'normal';
export type VoiceMode = 'female' | 'male' | 'system';

export type SpeakOptions = {
    text: string;
    mode?: SpeakMode;
    rate?: SpeakRate;
    voice?: VoiceMode;
    azureVoice?: string;
    allowCloud?: boolean;
};

const AZURE_SPEECH_KEY = process.env.EXPO_PUBLIC_AZURE_SPEECH_KEY?.trim();
const AZURE_SPEECH_REGION = process.env.EXPO_PUBLIC_AZURE_SPEECH_REGION?.trim();
const AZURE_SPEECH_VOICE = process.env.EXPO_PUBLIC_AZURE_SPEECH_VOICE?.trim();

const DEFAULT_FEMALE_VOICE = AZURE_SPEECH_VOICE || 'vi-VN-HoaiMyNeural';
const DEFAULT_MALE_VOICE = 'vi-VN-NamMinhNeural';
const FALLBACK_LOG = 'Azure TTS unavailable, fallback to system speech.';

export let isSpeaking = false;
export let activeText: string | null = null;

export type TtsState = {
    isSpeaking: boolean;
    activeText: string | null;
};

type TtsListener = (state: TtsState) => void;

const listeners = new Set<TtsListener>();

let currentSound: Audio.Sound | null = null;
let audioModeReady = false;
let activeRequestId = 0;

function isAzureConfigured() {
    return Boolean(AZURE_SPEECH_KEY && AZURE_SPEECH_REGION);
}

function logFallback() {
    console.info(FALLBACK_LOG);
}

function notifyListeners() {
    const snapshot: TtsState = { isSpeaking, activeText };
    listeners.forEach((listener) => listener(snapshot));
}

export function getTtsState(): TtsState {
    return { isSpeaking, activeText };
}

export function subscribeTts(listener: TtsListener) {
    listeners.add(listener);
    listener(getTtsState());

    return () => {
        listeners.delete(listener);
    };
}

function normalizeText(raw: string) {
    return raw
        .normalize('NFC')
        .replace(/\s+/g, ' ')
        .replace(/\//g, ' ')
        .replace(/-/g, ' ')
        .trim();
}

function stripPunctuation(value: string) {
    return value.replace(/[.,!?;:()\[\]{}"']/g, '');
}

function applyWordMode(value: string) {
    const cleaned = stripPunctuation(value);
    const tokens = cleaned.split(' ').filter(Boolean);

    return tokens[0] ?? '';
}

function applySyllableMode(value: string) {
    const cleaned = stripPunctuation(value);
    const tokens = cleaned.split(' ').filter(Boolean);

    return tokens.join(' , ');
}

function applySentenceMode(value: string) {
    return value
        .replace(/([,;:])/g, '$1 ')
        .replace(/([.!?])/g, '$1 ')
        .replace(/\s+/g, ' ')
        .trim();
}

function preprocessText(text: string, mode: SpeakMode) {
    const normalized = normalizeText(text);

    if (!normalized) {
        return '';
    }

    if (mode === 'word') {
        return applyWordMode(normalized);
    }

    if (mode === 'syllable') {
        return applySyllableMode(normalized);
    }

    return applySentenceMode(normalized);
}

function resolveRate(mode: SpeakMode, rate: SpeakRate) {
    if (mode === 'syllable') {
        return 0.35;
    }

    switch (rate) {
        case 'very_slow':
            return 0.35;
        case 'slow':
            return 0.5;
        case 'normal':
        default:
            return 0.75;
    }
}

function resolveAzureMode(mode: SpeakMode) {
    return mode === 'sentence' ? 'sentence' : 'word';
}

function resolveAzureVoice(voice: VoiceMode, azureVoice?: string) {
    if (azureVoice) {
        return azureVoice;
    }

    if (voice === 'male') {
        return DEFAULT_MALE_VOICE;
    }

    return DEFAULT_FEMALE_VOICE;
}

async function ensureAudioMode() {
    if (audioModeReady) {
        return;
    }

    await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
    });
    audioModeReady = true;
}

async function unloadCurrentSound() {
    if (!currentSound) {
        return;
    }

    try {
        await currentSound.stopAsync();
    } catch {
        // Ignore stop errors.
    }

    try {
        await currentSound.unloadAsync();
    } catch {
        // Ignore unload errors.
    }

    currentSound.setOnPlaybackStatusUpdate(null);
    currentSound = null;
}

function setSpeaking(nextSpeaking: boolean, text: string | null) {
    const nextText = nextSpeaking ? text : null;

    if (isSpeaking === nextSpeaking && activeText === nextText) {
        return;
    }

    isSpeaking = nextSpeaking;
    activeText = nextText;
    notifyListeners();
}

async function speakWithSystem(text: string, mode: SpeakMode, rate: SpeakRate, requestId: number) {
    return new Promise<void>((resolve) => {
        try {
            Speech.speak(text, {
                language: 'vi-VN',
                rate: resolveRate(mode, rate),
                onStart: () => {
                    if (requestId === activeRequestId) {
                        setSpeaking(true, text);
                    }
                },
                onDone: () => {
                    if (requestId === activeRequestId) {
                        setSpeaking(false, null);
                    }
                    resolve();
                },
                onStopped: () => {
                    if (requestId === activeRequestId) {
                        setSpeaking(false, null);
                    }
                    resolve();
                },
                onError: () => {
                    if (requestId === activeRequestId) {
                        setSpeaking(false, null);
                    }
                    resolve();
                },
            });
        } catch {
            if (requestId === activeRequestId) {
                setSpeaking(false, null);
            }
            resolve();
        }
    });
}

async function speakWithAzure(text: string, mode: SpeakMode, voice: VoiceMode, azureVoice: string | undefined, requestId: number) {
    await ensureAudioMode();

    const audioUri = await synthesizeAzureSpeechToFile({
        text,
        mode: resolveAzureMode(mode),
        key: AZURE_SPEECH_KEY ?? '',
        region: AZURE_SPEECH_REGION ?? '',
        voice: resolveAzureVoice(voice, azureVoice),
    });

    const { sound } = await Audio.Sound.createAsync({ uri: audioUri }, { shouldPlay: true });

    if (requestId !== activeRequestId) {
        await sound.unloadAsync();
        return;
    }

    currentSound = sound;
    setSpeaking(true, text);

    await new Promise<void>((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
            if (!status.isLoaded) {
                return;
            }

            if (status.didJustFinish) {
                resolve();
            }
        });
    });

    if (requestId === activeRequestId) {
        await unloadCurrentSound();
        setSpeaking(false, null);
    }
}

export async function speak(options: SpeakOptions) {
    const {
        text,
        mode = 'sentence',
        rate = 'normal',
        voice = 'system',
        azureVoice,
        allowCloud = true,
    } = options;
    const processedText = preprocessText(text, mode);

    if (!processedText) {
        return;
    }

    await stop();
    const requestId = (activeRequestId += 1);
    setSpeaking(true, processedText);

    const wantsCloud = allowCloud && voice !== 'system';

    if (wantsCloud) {
        if (!isAzureConfigured()) {
            logFallback();
        } else {
            try {
                await speakWithAzure(processedText, mode === 'syllable' ? 'sentence' : mode, voice, azureVoice, requestId);
                return;
            } catch {
                logFallback();
            }
        }
    }

    await speakWithSystem(processedText, mode, rate, requestId);
}

export async function stop() {
    activeRequestId += 1;
    setSpeaking(false, null);

    try {
        await Speech.stop();
    } catch {
        // Ignore speech stop errors.
    }

    await unloadCurrentSound();
}
