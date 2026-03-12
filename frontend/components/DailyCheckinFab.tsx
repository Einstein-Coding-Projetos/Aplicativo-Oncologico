import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { usePathname } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useAppContext } from '../context/AppContext';

const moods = [
  { value: 1 as const, label: 'Triste', icon: 'sad-outline' as const, color: '#DC2626', bg: '#FEE2E2' },
  { value: 2 as const, label: 'Baixo', icon: 'cloudy-outline' as const, color: '#F59E0B', bg: '#FEF3C7' },
  { value: 3 as const, label: 'Neutro', icon: 'remove-circle-outline' as const, color: '#EAB308', bg: '#FEF9C3' },
  { value: 4 as const, label: 'Bem', icon: 'sunny-outline' as const, color: '#84CC16', bg: '#ECFCCB' },
  { value: 5 as const, label: 'Feliz', icon: 'happy-outline' as const, color: '#22C55E', bg: '#DCFCE7' },
];

const metricsConfig = [
  { key: 'nausea', label: 'Nivel de enjoo' },
  { key: 'pain', label: 'Nivel de dor' },
  { key: 'mobility', label: 'Mobilidade' },
  { key: 'energy', label: 'Energia' },
  { key: 'appetite', label: 'Apetite' },
] as const;

type MetricsKey = (typeof metricsConfig)[number]['key'];

type MetricsState = {
  nausea: number;
  pain: number;
  mobility: number;
  energy: number;
  appetite: number;
};

export default function DailyCheckinFab() {
  const pathname = usePathname();
  const { fabCompleted, submitDailyCheckin, resetFabStatus, todayEntry } = useAppContext();
  const [open, setOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [metrics, setMetrics] = useState<MetricsState>({
    nausea: 0,
    pain: 0,
    mobility: 0,
    energy: 0,
    appetite: 0,
  });

  const shouldHideFab = useMemo(() => {
    return pathname.includes('/perfil') || pathname.includes('/(auth)');
  }, [pathname]);

  if (shouldHideFab) return null;

  const hasAnyMetric = Object.values(metrics).some((value) => value > 0);
  const canSubmit = selectedMood !== null && text.trim().length > 0 && (!hasAnyMetric || consent);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.75,
      aspect: [1, 1],
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const clearMetrics = () => {
    setMetrics({ nausea: 0, pain: 0, mobility: 0, energy: 0, appetite: 0 });
    setConsent(false);
  };

  const closeSheet = () => setOpen(false);

  const handleSubmit = () => {
    if (!selectedMood) return;
    submitDailyCheckin(selectedMood, text.trim(), metrics, imageUri);
    setOpen(false);
    setText('');
    setSelectedMood(null);
    setImageUri(null);
    setConsent(false);
    setMetrics({ nausea: 0, pain: 0, mobility: 0, energy: 0, appetite: 0 });
  };

  const setMetricValue = (key: MetricsKey, value: number) => {
    setMetrics((prev) => ({
      ...prev,
      [key]: prev[key] === value ? 0 : value,
    }));
  };

  return (
    <>
      <Pressable
        className={`absolute bottom-36 right-6 h-14 w-14 items-center justify-center rounded-full border shadow-lg ${
          fabCompleted ? 'border-emerald-300/60 bg-emerald-500' : 'border-cyan-300/70 bg-[#0B63F6]'
        }`}
        onPress={() => {
          resetFabStatus();
          setOpen(true);
        }}
      >
        <Ionicons name={fabCompleted ? 'checkmark' : 'add'} size={28} color="#fff" />
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={closeSheet}>
        <View className="flex-1 bg-black/55">
          <Pressable className="flex-1" onPress={closeSheet} />
          <View className="h-[88%] rounded-t-md border border-[#2A3C60] bg-[#0E1A33] px-5 pb-6 pt-3">
            <View className="mb-2 flex-row items-center justify-center">
              <Pressable onPress={closeSheet} className="h-1.5 w-14 rounded-full bg-slate-500" />
            </View>
            <View className="mb-2 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <Ionicons name="chevron-down" size={18} color="#D2DDF2" />
                <Text className="text-lg font-semibold text-white">Entrada do diario</Text>
              </View>
              <Pressable onPress={closeSheet}>
                <Ionicons name="close" size={22} color="#D2DDF2" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 26 }}>
              {todayEntry ? (
                <View className="mb-3 rounded-md border border-orange-300/40 bg-orange-500/20 p-3">
                  <Text className="text-xs font-medium text-orange-100">
                    Ja existe um relato de hoje. Ao salvar, ele sera substituido.
                  </Text>
                </View>
              ) : null}

              <Text className="text-sm font-semibold text-slate-100">Humor geral</Text>
              <View className="mt-2 flex-row justify-between">
                {moods.map((mood) => {
                  const isActive = selectedMood === mood.value;
                  return (
                    <Pressable
                      key={mood.value}
                      className="items-center rounded-md border px-2 py-2"
                      style={{
                        borderColor: isActive ? mood.color : '#324669',
                        backgroundColor: isActive ? mood.bg : '#10213F',
                      }}
                      onPress={() => setSelectedMood(mood.value)}
                    >
                      <Ionicons name={mood.icon} size={24} color={mood.color} />
                      <Text className="mt-1 text-xs" style={{ color: mood.color }}>{mood.label}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <TextInput
                value={text}
                onChangeText={setText}
                multiline
                className="mt-4 min-h-24 rounded-md border border-[#324669] bg-white/10 p-3 text-slate-100"
                placeholder="Escreva um breve relato do seu dia..."
                placeholderTextColor="#9FB2D8"
              />

              <Pressable
                className="mt-3 flex-row items-center justify-center gap-2 rounded-md border border-cyan-300/40 bg-cyan-500/20 py-3"
                onPress={pickImage}
              >
                <Ionicons name="image-outline" size={18} color="#BAE6FD" />
                <Text className="font-medium text-cyan-100">Adicionar imagem</Text>
              </Pressable>

              {imageUri ? (
                <View className="mt-3 w-full rounded-md border border-[#324669] bg-white/10 p-2">
                  <Image source={{ uri: imageUri }} className="aspect-square w-full rounded-md" resizeMode="cover" />
                </View>
              ) : null}

              <View className="mt-4 rounded-md border border-orange-300/40 bg-orange-500/15 p-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-orange-100">Como voce se sente? (opcional)</Text>
                  <Pressable className="rounded-md border border-orange-300/50 px-2 py-1" onPress={clearMetrics}>
                    <Text className="text-xs font-semibold text-orange-100">Limpar</Text>
                  </Pressable>
                </View>
                <Text className="mt-1 text-xs text-orange-100">
                  Essas informacoes podem ser uteis para a equipe medica.
                </Text>

                <View className="mt-3 gap-2">
                  {metricsConfig.map((item) => (
                    <View key={item.key} className="rounded-md border border-orange-300/30 bg-[#0E1A33] p-3">
                      <Text className="text-sm font-medium text-slate-100">{item.label}</Text>
                      <View className="mt-2 flex-row gap-2">
                        {[1, 2, 3, 4, 5].map((num) => {
                          const active = metrics[item.key] === num;
                          return (
                            <Pressable
                              key={num}
                              onPress={() => setMetricValue(item.key, num)}
                              className="h-8 w-8 items-center justify-center rounded-md border"
                              style={{
                                borderColor: active ? '#EA580C' : '#324669',
                                backgroundColor: active ? '#FB923C' : '#0F1F3D',
                              }}
                            >
                              <Text style={{ color: active ? '#FFFFFF' : '#D2DDF2', fontWeight: '700' }}>{num}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  ))}
                </View>

                {hasAnyMetric ? (
                  <Pressable
                    className={`mt-3 flex-row items-center gap-2 rounded-md border p-3 ${
                      consent ? 'border-cyan-300/40 bg-cyan-500/20' : 'border-[#324669] bg-[#0E1A33]'
                    }`}
                    onPress={() => setConsent((prev) => !prev)}
                  >
                    <Ionicons name={consent ? 'checkbox' : 'square-outline'} size={18} color={consent ? '#BAE6FD' : '#9FB2D8'} />
                    <Text className="flex-1 text-xs leading-5 text-slate-200">
                      Ao preencher, voce concorda em compartilhar essas informacoes com a equipe de cuidado do app.
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              <View className="mt-4 flex-row gap-3">
                <Pressable className="flex-1 rounded-md border border-[#324669] bg-white/10 py-3" onPress={closeSheet}>
                  <Text className="text-center font-medium text-slate-200">Fechar</Text>
                </Pressable>
                <Pressable
                  className={`flex-1 rounded-md py-3 ${canSubmit ? 'bg-[#0B63F6]' : 'bg-[#324669]'}`}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                >
                  <Text className="text-center font-semibold text-white">Salvar entrada</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}
