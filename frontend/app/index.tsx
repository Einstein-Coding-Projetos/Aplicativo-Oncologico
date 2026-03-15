import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import api from '../lib/api';

export default function Index() {
  const [loading, setLoading] = useState(true);
  // Aumentamos os tipos permitidos no targetRoute para incluir o psicólogo
  const [targetRoute, setTargetRoute] = useState<any>('/(auth)/login');

  useEffect(() => {
    (async () => {
      try {
        const auth = await api.isAuthenticated();
        if (!auth) {
          setTargetRoute('/(auth)/login');
          return;
        }

        const profile = await api.fetchUserProfile();
        
        // ORDEM DE PRIORIDADE:
        // 1º Verificamos se é Psicólogo
        if (profile.is_staff) {
          setTargetRoute('/(psicologo)');
          return; // Para a execução aqui!
        }

        // 2º Se não for psicólogo, verificamos a jornada do paciente
        const hasTreatment = Boolean(profile?.treatment_start_date && profile?.treatment_duration_days);
        setTargetRoute(hasTreatment ? '/(tabs)/diario' : '/(auth)/welcome');

      } catch (error) {
        console.error("Erro no redirecionamento:", error);
        setTargetRoute('/(auth)/login');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#070F21' }}>
        <ActivityIndicator size="large" color="#0B63F6" />
      </View>
    );
  }

  return <Redirect href={targetRoute} />;
}