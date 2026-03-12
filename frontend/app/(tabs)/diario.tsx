import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useAppContext } from '../../context/AppContext';

const moodMap: Record<number, { color: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  1: { color: '#EF4444', icon: 'sad-outline', label: 'Triste' },
  2: { color: '#F59E0B', icon: 'cloudy-outline', label: 'Baixo' },
  3: { color: '#FACC15', icon: 'remove-circle-outline', label: 'Neutro' },
  4: { color: '#84CC16', icon: 'sunny-outline', label: 'Bem' },
  5: { color: '#22C55E', icon: 'happy-outline', label: 'Feliz' },
};

const NODE_STEP = 168;
const START_Y = 42;

function previewText(text: string): string {
  const clean = text.trim();
  if (clean.length <= 52) return clean;
  return `${clean.slice(0, 52)}...`;
}

function buildPath(points: { x: number; y: number }[]): string {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    d += ` L ${points[i].x} ${points[i].y}`;
  }
  return d;
}

function localIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DiarioScreen() {
  const { entries } = useAppContext();
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [showWelcome, setShowWelcome] = useState(true);
  const [visibleCount, setVisibleCount] = useState(7);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const timelineRef = useRef<ScrollView>(null);
  const previousOffsetY = useRef(0);
  const previousEntryCount = useRef(entries.length);

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [entries]
  );

  const timelineEntries = useMemo(
    () => sortedEntries.slice(Math.max(0, sortedEntries.length - visibleCount)),
    [sortedEntries, visibleCount]
  );

  const selectedEntry = useMemo(
    () => sortedEntries.find((entry) => entry.id === selectedEntryId) ?? null,
    [sortedEntries, selectedEntryId]
  );

  const moodByDate = useMemo(() => {
    return entries.reduce((acc, entry) => {
      acc[entry.date] = entry.mood;
      return acc;
    }, {} as Record<string, number>);
  }, [entries]);

  const averageMood = useMemo(() => {
    if (!entries.length) return null;
    const total = entries.reduce((acc, item) => acc + item.mood, 0);
    return total / entries.length;
  }, [entries]);

  const currentStreak = useMemo(() => {
    const daysSet = new Set(entries.map((entry) => entry.date));
    let streak = 0;
    const cursor = new Date();
    while (daysSet.has(localIso(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }, [entries]);

  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 2600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (visibleCount > sortedEntries.length) {
      setVisibleCount(sortedEntries.length || 7);
    }
  }, [sortedEntries.length, visibleCount]);

  const loadOlderEntries = useCallback(() => {
    if (loadingOlder || visibleCount >= sortedEntries.length) return;
    setLoadingOlder(true);
    setVisibleCount((prev) => Math.min(sortedEntries.length, prev + 7));
    setTimeout(() => setLoadingOlder(false), 280);
  }, [loadingOlder, sortedEntries.length, visibleCount]);

  const screenWidth = Dimensions.get('window').width;
  const timelineWidth = screenWidth - 40;

  const points = useMemo(() => {
    const centerX = timelineWidth * 0.5;
    return timelineEntries.map((_, index) => ({ x: centerX, y: START_Y + index * NODE_STEP }));
  }, [timelineEntries, timelineWidth]);

  const pathD = useMemo(() => buildPath(points), [points]);
  const timelineHeight = Math.max(250, timelineEntries.length * NODE_STEP + 80);

  useEffect(() => {
    if (viewMode !== 'timeline') return;
    const timer = setTimeout(() => timelineRef.current?.scrollToEnd({ animated: false }), 80);
    return () => clearTimeout(timer);
  }, [viewMode]);

  useEffect(() => {
    if (entries.length > previousEntryCount.current && viewMode === 'timeline') {
      const timer = setTimeout(() => timelineRef.current?.scrollToEnd({ animated: true }), 90);
      previousEntryCount.current = entries.length;
      return () => clearTimeout(timer);
    }
    previousEntryCount.current = entries.length;
    return undefined;
  }, [entries.length, viewMode]);

  return (
    <SafeAreaView className="flex-1 bg-[#070F21]">
      <View className="px-5 pb-3 pt-3">
        <View className="overflow-hidden rounded-md border border-[#2A3C60] bg-[#0E1A33] p-4">
          <View className="mb-3 rounded-md border border-[#324669] bg-white/10 p-3">
            <Text className="text-base font-bold text-white">Diario emocional</Text>
            <Text className="mt-1 text-xs text-slate-300">
              Registre como voce esta hoje. Cada entrada ajuda a acompanhar sua evolucao durante o tratamento.
            </Text>
            <View className="mt-3 flex-row gap-2">
              <View className="flex-1 rounded-md border border-cyan-300/40 bg-cyan-500/20 p-2">
                <Text className="text-xs uppercase tracking-wide text-cyan-100">Registros</Text>
                <Text className="mt-1 text-lg font-black text-white">{entries.length}</Text>
              </View>
              <View className="flex-1 rounded-md border border-orange-300/40 bg-orange-500/20 p-2">
                <Text className="text-xs uppercase tracking-wide text-orange-100">Sequencia</Text>
                <Text className="mt-1 text-lg font-black text-white">{currentStreak} dia(s)</Text>
              </View>
              <View className="flex-1 rounded-md border border-emerald-300/40 bg-emerald-500/20 p-2">
                <Text className="text-xs uppercase tracking-wide text-emerald-100">Humor medio</Text>
                <Text className="mt-1 text-lg font-black text-white">{averageMood ? averageMood.toFixed(1) : '--'}</Text>
              </View>
            </View>
          </View>

          {showWelcome ? (
            <View className="mb-3 rounded-md border border-[#324669] bg-white/10 p-3">
              <Text className="text-sm font-semibold text-white">Bem-vindo(a) de volta.</Text>
            </View>
          ) : null}

          <View className="flex-row rounded-md border border-[#324669] bg-white/10 p-1">
            <Pressable
              className={`flex-1 rounded-md py-2 ${viewMode === 'timeline' ? 'border border-cyan-300/40 bg-cyan-500/20' : ''}`}
              onPress={() => setViewMode('timeline')}
            >
              <Text className={`text-center font-semibold ${viewMode === 'timeline' ? 'text-cyan-100' : 'text-slate-300'}`}>
                Timeline
              </Text>
            </Pressable>
            <Pressable
              className={`flex-1 rounded-md py-2 ${viewMode === 'calendar' ? 'border border-orange-300/40 bg-orange-500/20' : ''}`}
              onPress={() => setViewMode('calendar')}
            >
              <Text className={`text-center font-semibold ${viewMode === 'calendar' ? 'text-orange-100' : 'text-slate-300'}`}>
                Visao mensal
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {viewMode === 'calendar' ? (
        <View className="mx-5 rounded-md border border-[#2A3C60] bg-[#0E1A33] p-4">
          <View className="items-center">
            <View style={{ width: Math.min(screenWidth - 70, 360) }}>
              <Calendar
                style={{ alignSelf: 'center' }}
                dayComponent={({ date, state }) => {
                  if (!date) return <View style={{ width: 44, height: 44, marginVertical: 4 }} />;
                  const mood = moodByDate[date.dateString];
                  const moodColor = mood ? moodMap[mood].color : 'transparent';
                  return (
                    <View style={{ width: 44, height: 44, marginVertical: 4, alignItems: 'center', justifyContent: 'center' }}>
                      <View
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 17,
                          backgroundColor: mood ? moodColor : '#17294A',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ color: mood ? '#fff' : state === 'disabled' ? '#5B6F96' : '#D2DDF2', fontWeight: '600' }}>
                          {date.day}
                        </Text>
                      </View>
                    </View>
                  );
                }}
                theme={{
                  calendarBackground: '#0E1A33',
                  monthTextColor: '#FFFFFF',
                  dayTextColor: '#D2DDF2',
                  textDisabledColor: '#4E638C',
                  todayTextColor: '#5CC8FF',
                  arrowColor: '#5CC8FF',
                  textMonthFontWeight: '700',
                  textDayHeaderFontWeight: '600',
                  textSectionTitleColor: '#93A7CC',
                }}
              />
            </View>
          </View>
        </View>
      ) : (
        <ScrollView
          ref={timelineRef}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
          onScroll={(event) => {
            const y = event.nativeEvent.contentOffset.y;
            const isGoingUp = y < previousOffsetY.current;
            if (y <= 18 && isGoingUp) {
              loadOlderEntries();
            }
            previousOffsetY.current = y;
          }}
          scrollEventThrottle={16}
        >
          {timelineEntries.length === 0 ? (
            <View className="mt-4 rounded-md border border-dashed border-cyan-300/40 bg-cyan-500/20 p-5">
              <Text className="text-sm text-cyan-100">
                Nenhum checkpoint ainda. Use o botao + para registrar seu check-in diario.
              </Text>
            </View>
          ) : (
            <View className="relative mt-3" style={{ height: timelineHeight }}>
              <Svg width={timelineWidth} height={timelineHeight} style={{ position: 'absolute', left: 0, top: 0 }}>
                <Path d={pathD} stroke="#38BDF8" strokeWidth={3} fill="none" strokeDasharray="5 9" />
              </Svg>

              {timelineEntries.map((entry, index) => {
                const mood = moodMap[entry.mood];
                const point = points[index];
                const cardWidth = timelineWidth * 0.4;
                const isRight = index % 2 === 0;
                const cardLeft = isRight ? timelineWidth - cardWidth - 10 : 10;

                return (
                  <View key={entry.id}>
                    <View
                      style={{ left: point.x - 13, top: point.y - 13 }}
                      className="absolute h-7 w-7 items-center justify-center rounded-full border border-[#2A3C60] bg-[#0E1A33]"
                    >
                      <View className="h-4 w-4 rounded-full" style={{ backgroundColor: mood.color }} />
                    </View>

                    <View
                      style={{ left: cardLeft, top: point.y - 24, width: cardWidth }}
                      className="absolute rounded-md border border-[#40608A] bg-[#1B2B47] p-3"
                    >
                      <View className="flex-row items-center gap-2">
                        <Ionicons name={mood.icon} size={16} color={mood.color} />
                        <Text className="text-sm font-semibold text-white">{mood.label}</Text>
                      </View>
                      <Text className="mt-1 text-xs text-slate-300">{entry.date.split('-').reverse().join('/')}</Text>
                      {entry.imageUri ? (
                        <Image source={{ uri: entry.imageUri }} className="mt-2 h-16 w-full rounded-sm" resizeMode="cover" />
                      ) : null}
                      <Text className="mt-2 text-sm leading-5 text-slate-100">{previewText(entry.text)}</Text>
                      <Pressable onPress={() => setSelectedEntryId(entry.id)} className="mt-2 self-start rounded-sm border border-cyan-300/40 bg-cyan-500/20 px-2 py-1">
                        <Text className="text-xs font-semibold text-cyan-100">Ver mais</Text>
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      )}

      <Modal visible={Boolean(selectedEntry)} transparent animationType="slide" onRequestClose={() => setSelectedEntryId(null)}>
        <View className="flex-1 bg-black/55">
          <Pressable className="flex-1" onPress={() => setSelectedEntryId(null)} />
          <View className="h-[78%] rounded-t-md border border-[#2A3C60] bg-[#0E1A33] px-5 pb-6 pt-3">
            <View className="mb-2 flex-row items-center justify-center">
              <View className="h-1.5 w-14 rounded-full bg-slate-500" />
            </View>
            {selectedEntry ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name={moodMap[selectedEntry.mood].icon} size={18} color={moodMap[selectedEntry.mood].color} />
                    <Text className="text-lg font-semibold text-white">{moodMap[selectedEntry.mood].label}</Text>
                  </View>
                  <Pressable onPress={() => setSelectedEntryId(null)}>
                    <Ionicons name="close" size={22} color="#D2DDF2" />
                  </Pressable>
                </View>

                <Text className="mt-2 text-sm text-slate-300">{selectedEntry.date.split('-').reverse().join('/')}</Text>
                <Text className="mt-3 text-base leading-6 text-slate-100">{selectedEntry.text}</Text>

                {selectedEntry.imageUri ? (
                  <View className="mt-4 w-full rounded-md border border-[#324669] bg-white/10 p-2">
                    <Image source={{ uri: selectedEntry.imageUri }} className="aspect-square w-full rounded-sm" resizeMode="cover" />
                  </View>
                ) : null}

                {Object.values(selectedEntry.metrics).some((v) => v > 0) ? (
                  <View className="mt-4 rounded-md border border-orange-300/40 bg-orange-500/15 p-3">
                    <Text className="text-sm font-semibold text-orange-100">Como voce se sente</Text>
                    <Text className="mt-1 text-xs text-orange-100">Escala de 1 a 5 registrada no check-in.</Text>
                    <View className="mt-3 gap-1">
                      <Text className="text-xs text-slate-100">Enjoo: {selectedEntry.metrics.nausea || '-'}</Text>
                      <Text className="text-xs text-slate-100">Dor: {selectedEntry.metrics.pain || '-'}</Text>
                      <Text className="text-xs text-slate-100">Mobilidade: {selectedEntry.metrics.mobility || '-'}</Text>
                      <Text className="text-xs text-slate-100">Energia: {selectedEntry.metrics.energy || '-'}</Text>
                      <Text className="text-xs text-slate-100">Apetite: {selectedEntry.metrics.appetite || '-'}</Text>
                    </View>
                  </View>
                ) : null}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
