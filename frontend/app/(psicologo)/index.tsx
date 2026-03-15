import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../lib/api';

// 1. ISSO AQUI DEFINE O FORMATO DO SINAL (Limpa os erros de baixo)
interface AgendaItem {
  id: number | string;
  paciente: string;
  date: string;
  horario: string;
  status: string;
}

export default function AgendaPsicologo() {
  const router = useRouter();
  
  // 2. AQUI DIZEMOS AO STATE QUE ELE É UM ARRAY DE AgendaItem
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const carregarAgenda = async () => {
    try {
      setLoading(true);
      const data = await api.fetchPsicologoAgenda();
      setAgenda(data || []);
    } catch (e) {
      console.error("Erro ao carregar agenda:", e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { carregarAgenda(); }, []));

  return (
    <View style={styles.container}>
      <Calendar
        theme={{ calendarBackground: '#0E1A33', dayTextColor: '#fff', todayTextColor: '#0B63F6', monthTextColor: '#7DD3FC' }}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{ [selectedDate]: { selected: true, selectedColor: '#0B63F6' } }}
      />
      
      <View style={styles.headerRow}>
        <Text style={styles.title}>Horários para {selectedDate}</Text>
        {loading && <ActivityIndicator size="small" color="#0B63F6" />}
      </View>

      <FlatList
        data={agenda.filter(a => a.date === selectedDate)}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>{item.horario} - {item.paciente}</Text>
            <Text style={styles.statusBadge}>{item.status}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum horário liberado para este dia.</Text>}
      />

      <Pressable 
        style={styles.fab} 
        onPress={() => router.push({ pathname: "/(psicologo)/ajustar", params: { date: selectedDate } })}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.fabText}>LIBERAR HORÁRIO</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070F21', padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 15 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  card: { backgroundColor: '#1B2A49', padding: 15, borderRadius: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  cardText: { color: '#fff', fontWeight: '500' },
  statusBadge: { color: '#7DD3FC', fontSize: 12 },
  empty: { color: '#64748B', textAlign: 'center', marginTop: 30 },
  fab: { backgroundColor: '#0B63F6', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  fabText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 }
});