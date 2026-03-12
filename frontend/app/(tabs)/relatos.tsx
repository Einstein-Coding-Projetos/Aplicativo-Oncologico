import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '../../context/AppContext';
import api from '../../lib/api';
import { getStoredJson, setStoredJson } from '../../lib/storage';

type Relato = {
  id: number;
  titulo: string;
  subtitulo?: string | null;
  conteudo: string;
  data?: string;
};

function getReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export default function RelatosScreen() {
  const { dailyTaskCompleted } = useAppContext();
  const [relato, setRelato] = useState<Relato | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRelato = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    try {
      if (mode === 'initial') setLoading(true);
      if (mode === 'refresh') setRefreshing(true);
      setError(null);
      const data = await api.fetchRelatoDoDia();
      setRelato(data);
      await setStoredJson('relato_do_dia_cache_v1', data);
    } catch (err: any) {
      const message = err?.message ?? 'Falha ao carregar o relato do dia.';
      if (message.toLowerCase().includes('nenhum relato')) {
        setRelato(null);
        setError(null);
      } else {
        const cached = await getStoredJson<Relato | null>('relato_do_dia_cache_v1', null);
        if (cached) {
          setRelato(cached);
          setError('Sem conexao com a API. Exibindo o ultimo relato salvo neste dispositivo.');
        } else {
          setError(message);
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!dailyTaskCompleted) return;
    loadRelato();
  }, [dailyTaskCompleted, loadRelato]);

  if (!dailyTaskCompleted) {
    return (
      <SafeAreaView className="flex-1 bg-[#070F21] p-5">
        <LinearGradient colors={['#1F3B8A', '#0EA5E9']} style={{ borderRadius: 10, padding: 18 }}>
          <Text className="text-2xl font-black text-white">Relatos</Text>
          <Text className="mt-1 text-sm text-blue-100">Conteudo educativo diario</Text>

          <View className="mt-5 rounded-md border border-orange-200/50 bg-orange-500/20 p-6">
            <Ionicons name="lock-closed" size={24} color="#FDBA74" />
            <Text className="mt-3 text-base font-bold text-white">Conteudo bloqueado</Text>
            <Text className="mt-2 text-sm leading-6 text-orange-100">
              Complete seu check-in diario no botao flutuante para desbloquear o relato de hoje.
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#070F21]">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadRelato('refresh')} tintColor="#7DD3FC" />}
      >
        <LinearGradient colors={['#1E3A8A', '#4F46E5', '#0EA5E9']} style={{ borderRadius: 10, padding: 16 }}>
          <Text className="text-2xl font-black text-white">Relato do dia</Text>
          <Text className="mt-1 text-sm text-blue-100">Leitura orientada para autocuidado e clareza emocional.</Text>
        </LinearGradient>

        {loading && (
          <View className="mt-4 rounded-md border border-[#314466] bg-[#0E1A33] p-4">
            <Text className="text-sm text-slate-200">Carregando relato...</Text>
          </View>
        )}

        {!loading && error && (
          <View className="mt-4 rounded-md border border-red-300/40 bg-red-500/20 p-4">
            <Text className="text-sm text-red-100">{error}</Text>
            <Pressable className="mt-3 self-start rounded-md bg-red-500 px-4 py-2" onPress={() => loadRelato('refresh')}>
              <Text className="font-semibold text-white">Tentar novamente</Text>
            </Pressable>
          </View>
        )}

        {!loading && !error && !relato && (
          <View className="mt-4 rounded-md border border-orange-300/40 bg-orange-500/20 p-4">
            <Text className="text-sm text-orange-100">Nenhum relato disponivel no momento. Puxe para atualizar quando houver conexao.</Text>
          </View>
        )}

        {!loading && !error && relato && (
          <View className="mt-4 overflow-hidden rounded-md border border-[#314466] bg-[#0E1A33] p-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-bold uppercase tracking-wide text-cyan-300">Destaque de hoje</Text>
              <View className="rounded-md bg-orange-500/30 px-2 py-1">
                <Text className="text-xs font-semibold text-orange-100">{getReadingTime(relato.conteudo)} min</Text>
              </View>
            </View>

            <Text className="mt-2 text-xl font-black text-white">{relato.titulo}</Text>
            {relato.subtitulo ? <Text className="mt-1 text-sm text-blue-200">{relato.subtitulo}</Text> : null}
            <Text className="mt-3 text-sm leading-6 text-slate-200">{relato.conteudo}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
