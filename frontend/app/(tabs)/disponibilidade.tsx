import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../lib/api';

export default function AgendaPsicologoScreen() {
  const [minhasDisps, setMinhasDisps] = useState<any[]>([]);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [mode, setMode] = useState<'date' | 'time'>('date');

  const carregarHorarios = async () => {
    try {
      const data = await api.fetchMinhasDisponibilidades();
      setMinhasDisps(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { carregarHorarios(); }, []);

  const handleAdd = async () => {
    try {
      const dataStr = date.toISOString().split('T')[0];
      const horaStr = date.toTimeString().split(' ')[0].substring(0, 5);
      await api.createDisponibilidade({ data: dataStr, horario: horaStr });
      Alert.alert("Sucesso", "Horário liberado!");
      carregarHorarios();
    } catch (e) { Alert.alert("Erro", "Horário já existe ou erro de conexão."); }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Remover", "Deseja remover este horário disponível?", [
      { text: "Não" },
      { text: "Sim", onPress: async () => {
          await api.deleteDisponibilidade(id);
          carregarHorarios();
      }}
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#070F21]">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Header Identico ao de Agendamento */}
        <View className="relative overflow-hidden rounded-md border border-[#2A3C60] bg-[#0E1A33] p-4 mb-6">
          <View className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-blue-500/30" />
          <Text className="text-2xl font-bold text-white">Minha Agenda</Text>
          <Text className="mt-1 text-sm text-blue-100">Gestão de horários disponíveis.</Text>
        </View>

        {/* Bloco de Adicionar */}
        <View className="bg-[#0F1F3D] p-4 rounded-xl border border-[#324669] mb-6">
          <Text className="text-cyan-100 font-semibold mb-4">Novo Horário</Text>
          <View className="flex-row gap-2 mb-4">
            <Pressable onPress={() => {setMode('date'); setShowPicker(true)}} className="flex-1 bg-[#1A263F] p-3 rounded-lg border border-[#324669]">
              <Text className="text-white text-center">{date.toLocaleDateString('pt-BR')}</Text>
            </Pressable>
            <Pressable onPress={() => {setMode('time'); setShowPicker(true)}} className="flex-1 bg-[#1A263F] p-3 rounded-lg border border-[#324669]">
              <Text className="text-white text-center">{date.toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</Text>
            </Pressable>
          </View>
          <Pressable onPress={handleAdd} className="bg-[#0B63F6] py-3 rounded-lg">
            <Text className="text-white text-center font-bold">ADICIONAR HORÁRIO</Text>
          </Pressable>
        </View>

        {/* Lista de Horários Cadastrados */}
        <Text className="text-cyan-100 font-semibold mb-3">Horários Cadastrados</Text>
        {minhasDisps.map((item) => (
          <View key={item.id} className="flex-row justify-between items-center bg-[#0F1F3D] p-4 rounded-xl border border-[#324669] mb-2">
            <View>
              <Text className="text-white font-bold">{item.data.split('-').reverse().join('/')}</Text>
              <Text className="text-slate-400 text-xs">{item.horario}</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <Text className={item.foi_agendado ? "text-orange-500 text-xs" : "text-green-500 text-xs"}>
                {item.foi_agendado ? "AGENDADO" : "LIVRE"}
              </Text>
              {!item.foi_agendado && (
                <Pressable onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#FF4444" />
                </Pressable>
              )}
            </View>
          </View>
        ))}

        {showPicker && (
          <DateTimePicker 
            value={date} 
            mode={mode} 
            is24Hour={true} 
            onChange={(e, d) => {setShowPicker(false); if(d) setDate(d)}} 
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}