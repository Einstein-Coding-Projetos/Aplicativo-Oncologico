import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../lib/api';

type UserProfile = {
  id: number;
  username: string;
  email: string;
  user_type: string;
  bio: string | null;
  treatment_start_date: string | null;
  treatment_duration_days: number | null;
  current_day: number;
  treatment_progress_percent: number;
  activity_streak: number;
  today_activity_completed: boolean;
  created_at: string;
};

function profileTypeLabel(value: string): string {
  if (value === 'psychologist') return 'Psicologo(a)';
  return 'Paciente';
}

export default function PerfilScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.fetchUserProfile();
      setProfile(data);
    } catch (err: any) {
      setError(err?.message ?? 'Nao foi possivel carregar o perfil.');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const confirmLogout = () => {
    Alert.alert('Sair da conta', 'Deseja encerrar sua sessao agora?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await api.logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#070F21]">
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="relative overflow-hidden rounded-md border border-[#2A3C60] bg-[#0E1A33] p-5">
          <View className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-blue-500/30" />
          <View className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-orange-500/30" />
          <Text className="text-2xl font-black text-white">Perfil</Text>
          <Text className="mt-1 text-sm text-blue-100">Dados vinculados a sua conta.</Text>

          {loading ? <Text className="mt-4 text-sm text-slate-200">Carregando perfil...</Text> : null}

          {!loading && error ? (
            <View className="mt-4 rounded-md border border-red-300/40 bg-red-500/20 p-3">
              <Text className="text-sm text-red-100">{error}</Text>
              <Pressable className="mt-3 self-start rounded-md bg-red-500 px-3 py-2" onPress={loadProfile}>
                <Text className="font-semibold text-white">Tentar novamente</Text>
              </Pressable>
            </View>
          ) : null}

          {!loading && !error && profile ? (
            <View className="mt-4 rounded-md border border-[#324669] bg-white/10 p-4">
              <Text className="text-base font-bold text-white">{profile.username}</Text>
              <Text className="mt-1 text-sm text-blue-200">{profile.email || 'E-mail nao informado'}</Text>
              <Text className="mt-3 text-xs uppercase tracking-wide text-cyan-100">Tipo de usuario</Text>
              <Text className="mt-1 text-sm text-white">{profileTypeLabel(profile.user_type)}</Text>
              <Text className="mt-3 text-xs uppercase tracking-wide text-cyan-100">Bio</Text>
              <Text className="mt-1 text-sm text-white">{profile.bio || 'Nao informada'}</Text>
              <Text className="mt-3 text-xs uppercase tracking-wide text-cyan-100">Progresso do tratamento</Text>
              <Text className="mt-1 text-sm text-white">
                Dia atual: {profile.current_day} | Progresso: {Math.round(profile.treatment_progress_percent || 0)}%
              </Text>
              <Text className="mt-1 text-sm text-white">Sequencia de atividades: {profile.activity_streak}</Text>
            </View>
          ) : null}
        </View>

        <View className="mt-4 gap-2">
          <View className="rounded-md border border-orange-300/40 bg-orange-500/20 p-4">
            <Text className="font-semibold text-white">Edicao de perfil</Text>
            <Text className="text-xs text-orange-100">
              Atualizacao de dados ainda nao disponivel neste app. Os dados exibidos sao lidos da API.
            </Text>
          </View>

          <Pressable onPress={confirmLogout} className="rounded-md border border-red-300/40 bg-red-500/20 p-4">
            <Text className="font-semibold text-red-100">Sair</Text>
            <Text className="text-xs text-red-200">Encerrar sessao atual</Text>
          </Pressable>

          <View className="rounded-md border border-blue-300/40 bg-blue-500/20 p-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="help-circle-outline" size={18} color="#BFDBFE" />
              <Text className="font-semibold text-white">Suporte</Text>
            </View>
            <Text className="mt-2 text-xs text-blue-100">Email: suporte@gradatim.app</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

