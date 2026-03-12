import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryStore = new Map<string, string>();

function getBrowserStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }

  return null;
}

export async function getStoredString(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    const browserStorage = getBrowserStorage();
    if (browserStorage) return browserStorage.getItem(key);
    return memoryStore.get(key) ?? null;
  }
}

export async function setStoredString(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
    return;
  } catch {
    const browserStorage = getBrowserStorage();
    if (browserStorage) {
      browserStorage.setItem(key, value);
      return;
    }
    memoryStore.set(key, value);
  }
}

export async function deleteStoredString(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
    return;
  } catch {
    const browserStorage = getBrowserStorage();
    if (browserStorage) {
      browserStorage.removeItem(key);
      return;
    }
    memoryStore.delete(key);
  }
}

export async function getStoredJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await getStoredString(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function setStoredJson<T>(key: string, value: T): Promise<void> {
  await setStoredString(key, JSON.stringify(value));
}
