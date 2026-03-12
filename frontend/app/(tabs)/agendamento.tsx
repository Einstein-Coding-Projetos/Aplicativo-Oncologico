import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../lib/api';
import { getStoredJson, setStoredJson } from '../../lib/storage';

type Slot = { date: string; horario: string };

type Service = {
  id: string;
  name: string;
  professional: string;
  color: string;
};

const services: Service[] = [
  { id: 'psico-onco', name: 'Psico-oncologia', professional: 'Dra. Helena Martins', color: '#0B63F6' },
  { id: 'terapia-familiar', name: 'Terapia familiar', professional: 'Dr. Ricardo Alves', color: '#0284C7' },
  { id: 'tcc', name: 'Terapia cognitiva', professional: 'Dra. Patricia Lima', color: '#EA580C' },
  { id: 'cuidados', name: 'Cuidados paliativos', professional: 'Dr. Lucas Ferreira', color: '#FB923C' },
];

const availableTimes = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

function getNextDays(total = 10) {
  const days = [] as string[];
  for (let i = 0; i < total; i += 1) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push(date.toISOString().split('T')[0]);
  }
  return days;
}

function formatDate(value: string) {
  const [, m, d] = value.split('-');
  return `${d}/${m}`;
}

export default function AgendamentoScreen() {
  const days = useMemo(() => getNextDays(12), []);
  const [selectedService, setSelectedService] = useState<Service | null>(services[0]);
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [occupied, setOccupied] = useState<Slot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [slotError, setSlotError] = useState<string | null>(null);

  const loadOccupied = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (!selectedService) return;
    if (mode === 'initial') setIsLoadingSlots(true);
    if (mode === 'refresh') setRefreshing(true);
    try {
      setSlotError(null);
      const data = await api.fetchHorariosOcupados(selectedService.professional);
      setOccupied(data);
      await setStoredJson(`occupied_slots_${selectedService.professional}`, data);
    } catch {
      const cached = await getStoredJson<Slot[]>(`occupied_slots_${selectedService.professional}`, []);
      setOccupied(cached);
      setSlotError('Sem conexao para atualizar horarios. Exibindo a ultima disponibilidade salva.');
    } finally {
      setIsLoadingSlots(false);
      setRefreshing(false);
    }
  }, [selectedService]);

  useEffect(() => {
    loadOccupied();
  }, [loadOccupied]);

  const isOccupied = (time: string) =>
    occupied.some((slot) => slot.date === selectedDate && slot.horario.startsWith(time));

  const handleConfirm = async () => {
    if (!selectedService || !selectedTime) {
      Alert.alert('Selecione o horario', 'Escolha um horario disponivel para continuar.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.createAppointment({
        profissional: selectedService.professional,
        date: selectedDate,
        horario: selectedTime,
      });
      setIsConfirmed(true);
      await loadOccupied('refresh');
    } catch (error: any) {
      Alert.alert('Falha ao confirmar', error?.message ?? 'Nao foi possivel concluir o agendamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#070F21]">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadOccupied('refresh')} tintColor="#7DD3FC" />}
      >
        <View className="relative overflow-hidden rounded-md border border-[#2A3C60] bg-[#0E1A33] p-4">
          <View className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-blue-500/30" />
          <View className="absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-orange-500/30" />
          <Text className="text-2xl font-bold text-white">Agendamento</Text>
          <Text className="mt-1 text-sm text-blue-100">Fluxo rapido para marcar seu atendimento.</Text>
        </View>

        <View className="mt-4 rounded-md border border-[#324669] bg-white/10 p-4">
          <Text className="text-sm font-semibold text-cyan-100">1. Especialidade</Text>
          <View className="mt-3 gap-2">
            {services.map((service) => {
              const active = service.id === selectedService?.id;
              return (
                <Pressable
                  key={service.id}
                  className="rounded-md border px-4 py-3"
                  style={{
                    borderColor: active ? service.color : '#324669',
                    backgroundColor: active ? 'rgba(255,255,255,0.14)' : '#0F1F3D',
                  }}
                  onPress={() => {
                    setSelectedService(service);
                    setSelectedTime(null);
                    setIsConfirmed(false);
                  }}
                >
                  <Text className="font-semibold" style={{ color: active ? service.color : '#E2E8F0' }}>{service.name}</Text>
                  <Text className="text-xs text-slate-300">{service.professional}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-4 rounded-md border border-[#324669] bg-white/10 p-4">
          <Text className="text-sm font-semibold text-cyan-100">2. Data</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            <View className="flex-row gap-2">
              {days.map((day) => {
                const active = day === selectedDate;
                return (
                  <Pressable
                    key={day}
                    className="rounded-md border px-4 py-3"
                    style={{ borderColor: active ? '#5CC8FF' : '#324669', backgroundColor: active ? 'rgba(92,200,255,0.25)' : '#0F1F3D' }}
                    onPress={() => {
                      setSelectedDate(day);
                      setSelectedTime(null);
                      setIsConfirmed(false);
                    }}
                  >
                    <Text className="text-sm font-semibold" style={{ color: active ? '#BAE6FD' : '#D2DDF2' }}>{formatDate(day)}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View className="mt-4 rounded-md border border-[#324669] bg-white/10 p-4">
          <Text className="text-sm font-semibold text-cyan-100">3. Horarios disponiveis</Text>
          {slotError ? (
            <View className="mt-3 rounded-md border border-amber-300/40 bg-amber-500/20 p-3">
              <Text className="text-xs text-amber-100">{slotError}</Text>
            </View>
          ) : null}
          {isLoadingSlots ? (
            <View className="mt-3 flex-row items-center gap-2 rounded-md border border-[#324669] bg-[#0F1F3D] p-3">
              <ActivityIndicator color="#7DD3FC" />
              <Text className="text-sm text-slate-200">Buscando horarios disponiveis...</Text>
            </View>
          ) : null}
          <View className="mt-3 flex-row flex-wrap gap-2">
            {availableTimes.map((time) => {
              const blocked = isOccupied(time);
              const active = selectedTime === time;
              return (
                <Pressable
                  key={time}
                  className="rounded-md px-4 py-2"
                  style={{
                    backgroundColor: blocked ? '#2F3D57' : active ? '#EA580C' : '#0F1F3D',
                    borderColor: blocked ? '#4E638C' : active ? '#EA580C' : '#324669',
                    borderWidth: 1,
                  }}
                  disabled={blocked}
                  onPress={() => {
                    setSelectedTime(time);
                    setIsConfirmed(false);
                  }}
                >
                  <Text className="font-medium" style={{ color: blocked ? '#94A3B8' : active ? '#fff' : '#D2DDF2' }}>
                    {blocked ? 'Ocupado' : time}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-4 rounded-md border border-[#324669] bg-white/10 p-4">
          <Text className="text-sm font-semibold text-cyan-100">Resumo</Text>
          <Text className="mt-2 text-sm text-slate-100">Servico: {selectedService?.name ?? '-'}</Text>
          <Text className="text-sm text-slate-100">Profissional: {selectedService?.professional ?? '-'}</Text>
          <Text className="text-sm text-slate-100">Data: {formatDate(selectedDate)}</Text>
          <Text className="text-sm text-slate-100">Horario: {selectedTime ?? '-'}</Text>

          <Pressable
            className="mt-4 rounded-md py-3"
            style={{ backgroundColor: selectedTime ? '#0B63F6' : '#94A3B8' }}
            onPress={handleConfirm}
            disabled={!selectedTime || isSubmitting}
          >
            <Text className="text-center font-semibold text-white">
              {isSubmitting ? 'Confirmando...' : 'Confirmar agendamento'}
            </Text>
          </Pressable>

          {isConfirmed ? (
            <View className="mt-3 flex-row items-center gap-2 rounded-md border border-emerald-300/40 bg-emerald-500/20 p-3">
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text className="text-sm text-emerald-100">Agendamento confirmado. Horarios atualizados.</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
