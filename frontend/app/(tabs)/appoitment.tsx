import { StyleSheet, Text, View, Pressable, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useState } from 'react';

interface Appointment {
  id: string;
  title: string;
  date: string;
}

export default function AppointmentScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  
  // Lista de consultas marcadas (vazia por padrão)
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Função para adicionar uma consulta (evita warning de variável não utilizada)
  const addAppointment = (title: string, date: string) => {
    setAppointments((prev) => [...prev, { id: Date.now().toString(), title, date }]);
  };

  // Verifica se há consultas
  const hasAppointments = appointments.length > 0;

  const renderAppointment = (item: Appointment) => (
    <View style={[styles.appointmentItem, { borderColor: Colors[colorScheme ?? 'light'].tint }]}>
      <Text style={[styles.appointmentTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
        {item.title}
      </Text>
      <Text style={[styles.appointmentDate, { color: Colors[colorScheme ?? 'light'].text }]}>
        {item.date}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}> 
      {!hasAppointments ? (
        // Layout quando NÃO há consultas (botões centralizados)
        <>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            Appointments
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Manage your medical appointments here
          </Text>
          
          <Pressable 
            style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={() => router.push('/placeholder')}
          >
            <Text style={styles.buttonText}>Novo Agendamento</Text>
          </Pressable>

          <Pressable 
            style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint, marginTop: 20 }]}
            onPress={() => router.push('/consultas_passadas')}
          >
            <Text style={styles.buttonText}>Consultas Passadas</Text>
          </Pressable>

          {process.env.NODE_ENV === 'development' && (
            <Pressable
              style={[styles.button, { backgroundColor: '#999', marginTop: 20 }]}
              onPress={() => addAppointment('Consulta de teste', '01/01/2026')}
            >
              <Text style={styles.buttonText}>Adicionar exemplo</Text>
            </Pressable>
          )}
        </>
      ) : (
        // Layout quando HÁ consultas (botões no canto inferior direito)
        <>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            Suas Consultas
          </Text>
          
          <FlatList
            data={appointments}
            renderItem={({ item }) => renderAppointment(item)}
            keyExtractor={(item) => item.id}
            style={styles.appointmentList}
            scrollEnabled={true}
          />

          <Pressable 
            style={[styles.floatingButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={() => router.push('/placeholder')}
          >
            <Text style={styles.floatingButtonText}>+</Text>
          </Pressable>

          <Pressable 
            style={[styles.floatingButtonSecondary, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
            onPress={() => router.push('/consultas_passadas')}
          >
            <Text style={styles.floatingButtonText}>📋</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 30,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appointmentList: {
    flex: 1,
    width: '100%',
    marginBottom: 20,
  },
  appointmentItem: {
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  appointmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  appointmentDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  floatingButtonSecondary: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  floatingButtonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
});