import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../lib/api';

const HORARIOS = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

export default function AjustarAgenda() {
  const { date } = useLocalSearchParams();
  const router = useRouter();
  const [selecionados, setSelecionados] = useState<string[]>([]);

  const toggle = (h: string) => {
    setSelecionados(prev => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]);
  };

  const salvar = async () => {
    try {
      await api.saveDisponibilidade(date as string, selecionados);
      Alert.alert("Sucesso", "Agenda atualizada!");
      router.back();
    } catch (err) {
      Alert.alert("Erro", "Falha ao salvar horários.");
    }
  };

  return (
    <View className="flex-1 bg-[#070F21] p-6">
      <Text className="text-white text-xl font-bold mb-4">Liberar para {date}</Text>
      <ScrollView>
        <View className="flex-row flex-wrap justify-between">
          {HORARIOS.map(h => (
            <Pressable key={h} onPress={() => toggle(h)}
              className={`w-[48%] p-4 mb-4 rounded-xl border-2 ${selecionados.includes(h) ? 'bg-blue-600 border-blue-400' : 'bg-[#0E1A33] border-[#243354]'}`}>
              <Text className="text-white text-center font-bold">{h}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <Pressable onPress={salvar} className="bg-green-600 p-4 rounded-2xl items-center">
        <Text className="text-white font-bold">SALVAR HORÁRIOS</Text>
      </Pressable>
    </View>
  );
}