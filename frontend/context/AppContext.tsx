import React, { createContext, useContext, useMemo, useState } from 'react';

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

function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayIso(): string {
  return toLocalIsoDate(new Date());
}

function isoWithOffset(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return toLocalIsoDate(date);
}

function buildMockEntries(): JournalEntry[] {
  const baseMetrics: HealthMetrics[] = [
    { nausea: 2, pain: 2, mobility: 4, energy: 3, appetite: 3 },
    { nausea: 1, pain: 3, mobility: 3, energy: 2, appetite: 2 },
    { nausea: 3, pain: 2, mobility: 2, energy: 2, appetite: 2 },
    { nausea: 1, pain: 1, mobility: 4, energy: 4, appetite: 4 },
    { nausea: 2, pain: 2, mobility: 3, energy: 3, appetite: 3 },
    { nausea: 1, pain: 2, mobility: 4, energy: 4, appetite: 3 },
    { nausea: 0, pain: 1, mobility: 5, energy: 4, appetite: 4 },
    { nausea: 2, pain: 3, mobility: 3, energy: 2, appetite: 2 },
  ];

  const moods: MoodLevel[] = [4, 3, 2, 5, 4, 4, 5, 3];
  const texts = [
    'Dia mais leve, consegui manter uma rotina boa e descansar melhor.',
    'Oscilacao de energia durante a tarde, mas consegui concluir tarefas simples.',
    'Senti desconforto maior hoje e preferi reduzir o ritmo.',
    'Bom dia de recuperacao, com mais apetite e disposicao.',
    'Humor estavel e boa adesao aos cuidados planejados.',
    'Consegui caminhar um pouco mais e me senti mais confiante.',
    'Dia positivo, sintomas controlados e mente mais tranquila.',
    'Cansaco no fim do dia, mas consegui manter o check-in.',
  ];
  const offsets = [1, 2, 4, 6, 9, 12, 15, 20];

  return offsets.map((daysAgo, index) => ({
    id: `mock-${isoWithOffset(daysAgo)}`,
    date: isoWithOffset(daysAgo),
    mood: moods[index],
    text: texts[index],
    metrics: baseMetrics[index],
    imageUri: null,
  }));
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>(buildMockEntries);
  const [fabCompleted, setFabCompleted] = useState(false);
  const today = todayIso();

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
