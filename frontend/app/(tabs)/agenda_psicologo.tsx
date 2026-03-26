import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../lib/api';

export default function AgendaPsicologoScreen() {
  const [disponibilidades, setDisponibilidades] = useState<any[]>([]);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const carregarDados = async () => {
    try {
      const data = await api.fetchMinhasDisponibilidades();
      setDisponibilidades(data);
    } catch (e) {
      console.error("Erro ao carregar agenda", e);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const handleAdd = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        data: date.toISOString().split('T')[0],
        horario: date.toTimeString().split(' ')[0].substring(0, 5),
      };
      await api.createDisponibilidade(payload);
      Alert.alert("Sucesso", "Horário liberado para os pacientes!");
      carregarDados();
    } catch (e) {
      Alert.alert("Erro", "Este horário já foi cadastrado ou há erro de conexão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#070F21]">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* Cabeçalho igual ao Agendamento */}
        <View className="relative overflow-hidden rounded-md border border-[#2A3C60] bg-[#0E1A33] p-4 mb-6">
          <View className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-blue-500/30" />
          <View className="absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-orange-500/30" />
          <Text className="text-2xl font-bold text-white">Minha Agenda</Text>
          <Text className="mt-1 text-sm text-blue-100">Gerencie seus horários de atendimento.</Text>
        </View>

        {/* 1. Seleção de Horário */}
        <Text className="text-cyan-100 font-semibold mb-3 text-sm">1. Definir Nova Disponibilidade</Text>
        <View className="bg-[#0F1F3D] p-4 rounded-xl border border-[#324669] mb-6">
          <View className="flex-row gap-2 mb-4">
            <Pressable 
              onPress={() => {setMode('date'); setShowPicker(true)}}
              className="flex-1 bg-[#1A263F] p-4 rounded-lg border border-[#324669] items-center"
            >
              <Ionicons name="calendar-outline" size={18} color="#5CC8FF" />
              <Text className="text-white mt-1 font-medium">{date.toLocaleDateString('pt-BR')}</Text>
            </Pressable>

            <Pressable 
              onPress={() => {setMode('time'); setShowPicker(true)}}
              className="flex-1 bg-[#1A263F] p-4 rounded-lg border border-[#324669] items-center"
            >
              <Ionicons name="time-outline" size={18} color="#5CC8FF" />
              <Text className="text-white mt-1 font-medium">
                {date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
              </Text>
            </Pressable>
          </View>

          <Pressable 
            className="rounded-md py-3 bg-[#0B63F6]"
            onPress={handleAdd}
            disabled={isSubmitting}
          >
            <Text className="text-center font-bold text-white">
              {isSubmitting ? 'Salvando...' : 'LIBERAR ESTE HORÁRIO'}
            </Text>
          </Pressable>
        </View>

        {/* 2. Lista de Horários */}
        <Text className="text-cyan-100 font-semibold mb-3 text-sm">2. Seus Horários no Banco</Text>
        {disponibilidades.length === 0 ? (
          <Text className="text-slate-500 italic text-center mt-4">Nenhum horário cadastrado.</Text>
        ) : (
          disponibilidades.map((item) => (
            <View key={item.id} className="bg-[#0F1F3D] p-4 rounded-xl border border-[#324669] mb-2 flex-row justify-between items-center">
              <View>
                <Text className="text-white font-bold">{item.data.split('-').reverse().join('/')}</Text>
                <Text className="text-slate-400 text-xs">às {item.horario.substring(0, 5)}</Text>
              </View>
              <View className="flex-row items-center gap-3">
                 <View className={`px-2 py-1 rounded ${item.foi_agendado ? 'bg-orange-500/20' : 'bg-green-500/20'}`}>
                    <Text className={`text-[10px] font-bold ${item.foi_agendado ? 'text-orange-500' : 'text-green-500'}`}>
                        {item.foi_agendado ? 'AGENDADO' : 'LIVRE'}
                    </Text>
                 </View>
              </View>
            </View>
          ))
        )}

        {showPicker && (
          <DateTimePicker
            value={date}
            mode={mode}
            is24Hour={true}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e, d) => { setShowPicker(false); if(d) setDate(d); }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}