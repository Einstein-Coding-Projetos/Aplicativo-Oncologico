import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '../../context/AppContext';
import api from '../../lib/api';
import { getStoredJson, setStoredJson } from '../../lib/storage';

type Appointment = {
  id: string;
  profissional: string;
  date: string;
  horario: string;
  status: string;
};

function formatDate(value: string): string {
  const [y, m, d] = value.split('-');
  if (!y || !m || !d) return value;
  return `${d}/${m}/${y}`;
}

export default function ProgressScreen() {
  const { entries, dailyTaskCompleted } = useAppContext();
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [treatmentProgress, setTreatmentProgress] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [offlineInfo, setOfflineInfo] = useState<string | null>(null);
  const [treatmentSummary, setTreatmentSummary] = useState<{ currentDay: number; endDateLabel: string | null }>({
    currentDay: 0,
    endDateLabel: null,
  });

  const loadProfileProgress = useCallback(async () => {
    try {
      const profile = await api.fetchUserProfile();
      const progressPercent = Math.max(0, Math.min(100, Number(profile.treatment_progress_percent || 0)));
      const summary =
        profile.treatment_start_date && profile.treatment_duration_days
          ? {
              currentDay: Number(profile.current_day || 0),
              endDateLabel: new Date(
                new Date(`${profile.treatment_start_date}T00:00:00`).setDate(
                  new Date(`${profile.treatment_start_date}T00:00:00`).getDate() + profile.treatment_duration_days - 1
                )
              ).toLocaleDateString('pt-BR'),
            }
          : { currentDay: 0, endDateLabel: null };

      setTreatmentProgress(progressPercent / 100);
      setTreatmentSummary(summary);
      await setStoredJson('home_progress_cache_v1', {
        treatmentProgress: progressPercent / 100,
        treatmentSummary: summary,
      });
    } catch {
      const cached = await getStoredJson('home_progress_cache_v1', {
        treatmentProgress: 0,
        treatmentSummary: { currentDay: 0, endDateLabel: null },
      });
      setTreatmentProgress(cached.treatmentProgress);
      setTreatmentSummary(cached.treatmentSummary);
      setOfflineInfo((prev) => prev ?? 'Sem conexao com a API. Exibindo progresso salvo anteriormente.');
    }
  }, []);

 // 1. Defina primeiro a função de agendamentos
  const loadNextAppointment = useCallback(async () => {
    try {
      const data = await api.fetchAppointments();
      
      if (data && data.length > 0) {
        const agora = new Date();
        agora.setHours(0, 0, 0, 0);

        const pendentes = data.filter((item: Appointment) => {
          const dataConsulta = new Date(`${item.date}T00:00:00`);
          return item.status !== 'concluida' && dataConsulta >= agora;
        });

        if (pendentes.length > 0) {
          const sorted = [...pendentes].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );
          setNextAppointment(sorted[0]);
        } else {
          setNextAppointment(null);
        }
      } else {
        setNextAppointment(null);
        await setStoredJson('home_next_appointment_cache_v1', null);
      }
    } catch (error) {
      console.error("Erro ao atualizar fila de agendamentos:", error);
      setNextAppointment(null);
    }
  }, []); // Adicionei o fechamento correto aqui

  // 2. Defina o refreshDashboard DEPOIS das funções que ele chama
  const refreshDashboard = useCallback(async () => {
    setRefreshing(true);
    setOfflineInfo(null);
    try {
      // Agora ele reconhece as funções acima
      await Promise.all([
        loadProfileProgress(),
        loadNextAppointment()
      ]);
    } catch (error) {
      console.error("Erro ao atualizar dashboard:", error);
    } finally {
      setRefreshing(false);
    }
  }, [loadProfileProgress, loadNextAppointment]);

  // 3. O useFocusEffect vem por último
  useFocusEffect(
    useCallback(() => {
      refreshDashboard();
    }, [refreshDashboard])
  );

  const thisWeekCount = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    return entries.filter((entry) => new Date(entry.date) >= weekAgo).length;
  }, [entries]);

  const moodAverage = useMemo(() => {
    if (!entries.length) return 0;
    return entries.reduce((acc, item) => acc + item.mood, 0) / entries.length;
  }, [entries]);

  const healthAverages = useMemo(() => {
    const avg = (key: keyof (typeof entries)[number]['metrics']) => {
      const filled = entries.filter((item) => item.metrics[key] > 0);
      if (!filled.length) return 0;
      const total = filled.reduce((acc, item) => acc + item.metrics[key], 0);
      return total / filled.length;
    };

    return {
      nausea: avg('nausea'),
      pain: avg('pain'),
      mobility: avg('mobility'),
      energy: avg('energy'),
      appetite: avg('appetite'),
    };
  }, [entries]);

  const healthCards = [
    { label: 'Enjoo', value: healthAverages.nausea, icon: 'water-outline' as const, gradient: ['#516A92', '#3E547A'] },
    { label: 'Dor', value: healthAverages.pain, icon: 'bandage-outline' as const, gradient: ['#5E6288', '#464F78'] },
    { label: 'Mobilidade', value: healthAverages.mobility, icon: 'walk-outline' as const, gradient: ['#4B6D86', '#39566D'] },
    { label: 'Energia', value: healthAverages.energy, icon: 'flash-outline' as const, gradient: ['#4B6898', '#3D5380'] },
    { label: 'Apetite', value: healthAverages.appetite, icon: 'restaurant-outline' as const, gradient: ['#5F667F', '#4A536F'] },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#070F21]">
      <ScrollView
        contentContainerStyle={{ padding: 18, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshDashboard} tintColor="#7DD3FC" />}
      >
        <LinearGradient colors={['#1B2A49', '#243A61', '#2A446D']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 12, padding: 16 }}>
          <View className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/20" />
          <View className="absolute -left-10 -bottom-10 h-28 w-28 rounded-full bg-indigo-200/20" />
          <Text className="text-2xl font-black text-white">Progresso</Text>
          <Text className="mt-1 text-sm text-blue-100">Visao de desempenho, sintomas e consistencia.</Text>

          <View className="mt-4 rounded-md bg-white/10 p-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-bold uppercase tracking-wide text-blue-50">Jornada do tratamento</Text>
              <Text className="text-sm font-black text-white">{Math.round(treatmentProgress * 100)}%</Text>
            </View>
            <View className="mt-2 h-3 overflow-hidden rounded-sm bg-white/20">
              <LinearGradient colors={['#4D86D9', '#3970C1', '#2C5DA5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: '100%', width: `${Math.max(4, treatmentProgress * 100)}%` }} />
            </View>
            <Text className="mt-2 text-xs text-blue-100">
              {treatmentSummary.endDateLabel
                ? `Dia ${treatmentSummary.currentDay} da jornada. Previsao de termino: ${treatmentSummary.endDateLabel}.`
                : 'Defina o termino do tratamento na recepcao inicial para personalizar esta barra.'}
            </Text>
          </View>
        </LinearGradient>

        {offlineInfo ? (
          <View className="mt-4 rounded-md border border-amber-300/40 bg-amber-500/20 p-3">
            <Text className="text-xs text-amber-100">{offlineInfo}</Text>
          </View>
        ) : null}

        <View className="mt-4 flex-row gap-2">
          <LinearGradient colors={['#2D5CA1', '#3E73B8']} style={{ flex: 1, borderRadius: 10, padding: 12 }}>
            <Ionicons name="albums-outline" size={18} color="#fff" />
            <Text className="mt-2 text-xl font-black text-white">{entries.length}</Text>
            <Text className="mt-1 text-xs font-semibold text-blue-100">Registros totais</Text>
          </LinearGradient>

          <LinearGradient colors={['#8A5A3C', '#9C6648']} style={{ flex: 1, borderRadius: 10, padding: 12 }}>
            <Ionicons name="pulse-outline" size={18} color="#fff" />
            <Text className="mt-2 text-xl font-black text-white">{thisWeekCount}</Text>
            <Text className="mt-1 text-xs font-semibold text-amber-100">Ultimos 7 dias</Text>
          </LinearGradient>

          <LinearGradient colors={['#4D5E88', '#3F5177']} style={{ flex: 1, borderRadius: 10, padding: 12 }}>
            <Ionicons name="heart-outline" size={18} color="#fff" />
            <Text className="mt-2 text-xl font-black text-white">{moodAverage ? moodAverage.toFixed(1) : '--'}</Text>
            <Text className="mt-1 text-xs font-semibold text-slate-200">Media de humor</Text>
          </LinearGradient>
        </View>

        <View className="mt-4 rounded-md border border-[#243354] bg-[#0E1A33] p-4">
          <Text className="text-base font-black text-white">Indicadores autodeclarados</Text>
          <Text className="mt-1 text-xs text-blue-200">Escala media de 0 a 5 preenchida no check-in</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {healthCards.map((card) => (
              <LinearGradient key={card.label} colors={card.gradient as [string, string]} style={{ width: '48%', borderRadius: 10, padding: 10 }}>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-bold text-white">{card.label}</Text>
                  <Ionicons name={card.icon} size={16} color="#fff" />
                </View>
                <Text className="mt-2 text-lg font-black text-white">{entries.length ? card.value.toFixed(1) : '--'}</Text>
              </LinearGradient>
            ))}
          </View>
        </View>

        <View className="mt-4 rounded-md border border-[#243354] bg-[#0E1A33] p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-base font-black text-white">Próximo agendamento</Text>
            <Ionicons name="calendar-outline" size={18} color="#7DD3FC" />
          </View>

          {nextAppointment ? (
            <View className="mt-3 rounded-md border border-blue-400/40 bg-blue-500/20 p-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-bold text-white">{nextAppointment.profissional}</Text>
                <View className="bg-blue-400/20 px-2 py-0.5 rounded">
                  <Text className="text-[10px] text-blue-300 font-bold uppercase">Agendado</Text>
                </View>
              </View>
              
              <Text className="mt-1 text-sm text-blue-100">
                {formatDate(nextAppointment.date)} às {nextAppointment.horario}
              </Text>

              <Pressable 
                className="mt-4 rounded-md bg-green-600/80 py-2 items-center active:bg-green-700"
                onPress={async () => {
                  try {
                    // Chama o backend para mudar o status no Neon
                    const sucesso = await api.completeAppointment(nextAppointment.id);
                    if (sucesso) {
                      // RECARREGA A FILA: Isso fará a concluída sumir e a próxima aparecer
                      await loadNextAppointment(); 
                    }
                  } catch (error) {
                    console.error("Erro ao concluir:", error);
                  }
                }}
              >
                <Text className="text-xs font-black text-white">MARCAR COMO REALIZADA</Text>
              </Pressable>
            </View>
          ) : (
            <View className="mt-3 rounded-md border border-orange-300/40 bg-orange-500/20 p-3">
              <Text className="text-sm text-orange-100 font-medium">Nenhum evento futuro agendado.</Text>
              <Pressable 
                className="mt-3 self-start rounded-md bg-[#F97316] px-4 py-2" 
                onPress={() => router.push('/(tabs)/agendamento')}
              >
                <Text className="font-bold text-white text-xs">AGENDAR AGORA</Text>
              </Pressable>
            </View>
          )}
        </View>
        
        <View className="mt-4 rounded-md border border-[#243354] bg-[#0E1A33] p-4">
          <Text className="text-base font-black text-white">Acoes rapidas</Text>
          <View className="mt-3 gap-2">
            <Pressable onPress={() => router.push('/(tabs)/diario')} className="rounded-md border border-cyan-300/30 bg-cyan-500/20 p-3">
              <Text className="font-semibold text-white">Registrar no diario</Text>
              <Text className="text-xs text-cyan-100">{dailyTaskCompleted ? 'Entrada de hoje concluida' : 'Complete o check-in de hoje'}</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/(tabs)/relatos')} className="rounded-md border border-orange-300/30 bg-orange-500/20 p-3">
              <Text className="font-semibold text-white">Ler conteudo do dia</Text>
              <Text className="text-xs text-orange-100">Relatos e educacao em saude</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
