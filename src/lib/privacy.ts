import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'dyslexia-mobile-app:v2';

type PersistedState = {
    activeProfileId?: string;
    learnerRecords?: Array<{ profile?: { id?: string } }>;
    lessons?: unknown[];
};

export async function deleteChildData(childId: string) {
    if (!childId) {
        return;
    }

    const keys = await AsyncStorage.getAllKeys();
    const scopedKeys = keys.filter((key) => key.includes(childId));

    if (scopedKeys.length > 0) {
        await Promise.all(scopedKeys.map((key) => AsyncStorage.removeItem(key)));
    }

    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    if (!stored) {
        return;
    }

    try {
        const parsed = JSON.parse(stored) as PersistedState;
        const records = parsed.learnerRecords ?? [];
        const nextRecords = records.filter((record) => record?.profile?.id !== childId);

        if (nextRecords.length === 0) {
            await AsyncStorage.removeItem(STORAGE_KEY);
            return;
        }

        const nextActive =
            parsed.activeProfileId === childId ? nextRecords[0]?.profile?.id ?? '' : parsed.activeProfileId ?? '';

        const nextState: PersistedState = {
            ...parsed,
            activeProfileId: nextActive,
            learnerRecords: nextRecords,
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    } catch {
        // Ignore JSON parse errors.
    }
}

export async function deleteAllLocalData() {
    await AsyncStorage.clear();
}
