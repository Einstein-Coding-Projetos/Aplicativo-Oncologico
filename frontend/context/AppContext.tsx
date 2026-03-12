import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getStoredJson, setStoredJson } from '../lib/storage';

type MoodLevel = 1 | 2 | 3 | 4 | 5;
type HealthMetrics = {
  nausea: number;
  pain: number;
  mobility: number;
  energy: number;
  appetite: number;
};

export type JournalEntry = {
  id: string;
  date: string;
  mood: MoodLevel;
  text: string;
  imageUri?: string | null;
  metrics: HealthMetrics;
};

type AppContextValue = {
  dailyTaskCompleted: boolean;
  fabCompleted: boolean;
  entries: JournalEntry[];
  progress: number;
  todayEntry: JournalEntry | null;
  submitDailyCheckin: (
    mood: MoodLevel,
    text: string,
    metrics: HealthMetrics,
    imageUri?: string | null
  ) => void;
  resetFabStatus: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

const TARGET_DAYS = 90;
const JOURNAL_ENTRIES_KEY = 'journal_entries_v1';

function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayIso(): string {
  return toLocalIsoDate(new Date());
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [fabCompleted, setFabCompleted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const today = todayIso();

  useEffect(() => {
    (async () => {
      const storedEntries = await getStoredJson<JournalEntry[]>(JOURNAL_ENTRIES_KEY, []);
      setEntries(storedEntries);
      setHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setStoredJson(JOURNAL_ENTRIES_KEY, entries);
  }, [entries, hydrated]);

  const todayEntry = useMemo(() => {
    return entries.find((entry) => entry.date === today) ?? null;
  }, [entries, today]);
  const dailyTaskCompleted = Boolean(todayEntry);

  const progress = useMemo(() => {
    return Math.min(1, entries.length / TARGET_DAYS);
  }, [entries.length]);

  const submitDailyCheckin = (
    mood: MoodLevel,
    text: string,
    metrics: HealthMetrics,
    imageUri?: string | null
  ) => {
    const date = todayIso();
    setEntries((prev) => {
      const withoutToday = prev.filter((item) => item.date !== date);
      return [
        { id: `${date}-${Date.now()}`, date, mood, text, metrics, imageUri: imageUri ?? null },
        ...withoutToday,
      ];
    });
    setFabCompleted(true);
  };

  const resetFabStatus = () => setFabCompleted(false);

  return (
    <AppContext.Provider
      value={{
        dailyTaskCompleted,
        fabCompleted,
        entries,
        progress,
        todayEntry,
        submitDailyCheckin,
        resetFabStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
