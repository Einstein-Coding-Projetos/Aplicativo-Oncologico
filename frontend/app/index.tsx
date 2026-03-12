import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import api from '../lib/api';

export default function Index() {
  const [loading, setLoading] = useState(true);
  const [targetRoute, setTargetRoute] = useState<'/(tabs)/diario' | '/(auth)/login' | '/(auth)/welcome'>('/(auth)/login');

  useEffect(() => {
    (async () => {
      const auth = await api.isAuthenticated();
      if (!auth) {
        setTargetRoute('/(auth)/login');
        setLoading(false);
        return;
      }

      try {
        const profile = await api.fetchUserProfile();
        const hasTreatmentJourney = Boolean(profile?.treatment_start_date && profile?.treatment_duration_days);
        setTargetRoute(hasTreatmentJourney ? '/(tabs)/diario' : '/(auth)/welcome');
      } catch {
        setTargetRoute('/(tabs)/diario');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <View style={{ flex: 1 }} />;

  return <Redirect href={targetRoute} />;
}
