import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DatePickerField from '../../components/DatePickerField';
import api, { AccountMe, UserProfile } from '../../lib/api';
import { deleteStoredString, getStoredJson, setStoredJson } from '../../lib/storage';
import {
  buildTreatmentJourneyPayload,
  formatDateLabel,
  profileTreatmentEndDate,
  todayIsoDate,
} from '../../lib/treatment';

type LocalSettings = {
  remindersEnabled: boolean;
  insightCardsEnabled: boolean;
  privateModeEnabled: boolean;
};

type PendingPhoto = {
  uri: string;
  name?: string;
  type?: string;
} | null;

const SETTINGS_KEY = 'profile_settings_v1';
const ACCOUNT_CACHE_KEY = 'profile_account_cache_v1';

const defaultSettings: LocalSettings = {
  remindersEnabled: true,
  insightCardsEnabled: true,
  privateModeEnabled: false,
};

function profileTypeLabel(value: string): string {
  if (value === 'psychologist') return 'Psicologo(a)';
  return 'Paciente';
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function fullNameLabel(account: AccountMe): string {
  const fullName = `${account.first_name} ${account.last_name}`.trim();
  return fullName || account.username;
}

function extractProfile(account: AccountMe | null): UserProfile | null {
  return account?.profile ?? null;
}

export default function PerfilScreen() {
  const [account, setAccount] = useState<AccountMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedFromCache, setLoadedFromCache] = useState(false);

  const [firstNameDraft, setFirstNameDraft] = useState('');
  const [lastNameDraft, setLastNameDraft] = useState('');
  const [emailDraft, setEmailDraft] = useState('');
  const [bioDraft, setBioDraft] = useState('');
  const [treatmentEndDateDraft, setTreatmentEndDateDraft] = useState(todayIsoDate());
  const [settings, setSettings] = useState<LocalSettings>(defaultSettings);
  const [pendingPhoto, setPendingPhoto] = useState<PendingPhoto>(null);
  const [photoMarkedForRemoval, setPhotoMarkedForRemoval] = useState(false);

  useEffect(() => {
    (async () => {
      const storedSettings = await getStoredJson<LocalSettings>(SETTINGS_KEY, defaultSettings);
      setSettings(storedSettings);
    })();
  }, []);

  useEffect(() => {
    setStoredJson(SETTINGS_KEY, settings);
  }, [settings]);

  const syncDrafts = useCallback((data: AccountMe) => {
    const profile = extractProfile(data);
    setFirstNameDraft(data.first_name ?? '');
    setLastNameDraft(data.last_name ?? '');
    setEmailDraft(data.email ?? '');
    setBioDraft(profile?.bio ?? '');
    setTreatmentEndDateDraft(
      profileTreatmentEndDate(profile?.treatment_start_date, profile?.treatment_duration_days) ?? todayIsoDate()
    );
    setPendingPhoto(null);
    setPhotoMarkedForRemoval(false);
  }, []);

  const loadAccount = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (mode === 'initial') {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        setError(null);
        const data = await api.fetchAccountMe();
        setAccount(data);
        syncDrafts(data);
        setLoadedFromCache(false);
        await setStoredJson(ACCOUNT_CACHE_KEY, data);
      } catch (err: any) {
        const cachedAccount = await getStoredJson<AccountMe | null>(ACCOUNT_CACHE_KEY, null);
        if (cachedAccount) {
          setAccount(cachedAccount);
          syncDrafts(cachedAccount);
          setLoadedFromCache(true);
          setError('Sem conexao com a API. Exibindo os ultimos dados salvos neste dispositivo.');
        } else {
          setError(err?.message ?? 'Nao foi possivel carregar o perfil.');
          setAccount(null);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [syncDrafts]
  );

  useFocusEffect(
    useCallback(() => {
      loadAccount('initial');
    }, [loadAccount])
  );

  const profile = extractProfile(account);
  const originalTreatmentEndDate = useMemo(
    () => profileTreatmentEndDate(profile?.treatment_start_date, profile?.treatment_duration_days),
    [profile]
  );

  const avatarUri = useMemo(() => {
    if (pendingPhoto && !photoMarkedForRemoval) return pendingPhoto.uri;
    if (photoMarkedForRemoval) return null;
    return profile?.profile_photo_url ?? null;
  }, [pendingPhoto, photoMarkedForRemoval, profile?.profile_photo_url]);

  const hasChanges = useMemo(() => {
    if (!account || !profile) return false;
    return (
      firstNameDraft.trim() !== (account.first_name ?? '').trim() ||
      lastNameDraft.trim() !== (account.last_name ?? '').trim() ||
      emailDraft.trim() !== (account.email ?? '').trim() ||
      bioDraft.trim() !== (profile.bio ?? '').trim() ||
      treatmentEndDateDraft !== (originalTreatmentEndDate ?? todayIsoDate()) ||
      Boolean(pendingPhoto) ||
      photoMarkedForRemoval
    );
  }, [
    account,
    bioDraft,
    emailDraft,
    firstNameDraft,
    lastNameDraft,
    originalTreatmentEndDate,
    pendingPhoto,
    photoMarkedForRemoval,
    profile,
    treatmentEndDateDraft,
  ]);

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissao necessaria', 'Permita acesso as fotos para definir uma imagem de perfil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets.length) {
      return;
    }

    const asset = result.assets[0];
    setPendingPhoto({
      uri: asset.uri,
      name: asset.fileName ?? `profile-${Date.now()}.jpg`,
      type: asset.mimeType ?? 'image/jpeg',
    });
    setPhotoMarkedForRemoval(false);
  };

  const handleRemovePhoto = async () => {
    if (!profile) return;
    if (!profile.profile_photo_url && !pendingPhoto) return;
    setPhotoMarkedForRemoval(true);
    setPendingPhoto(null);
  };

  const handleSave = async () => {
    if (!account || !profile) return;

    setSaving(true);
    try {
      const updatedAccount = await api.updateAccountMe({
        first_name: firstNameDraft.trim(),
        last_name: lastNameDraft.trim(),
        email: emailDraft.trim(),
      });

      let updatedProfile = await api.updateUserProfile(profile.id, {
        bio: bioDraft.trim() || null,
        ...buildTreatmentJourneyPayload(treatmentEndDateDraft, profile.treatment_start_date),
      });

      if (pendingPhoto) {
        updatedProfile = await api.uploadProfilePhoto(profile.id, pendingPhoto);
      } else if (photoMarkedForRemoval) {
        updatedProfile = await api.removeProfilePhoto(profile.id);
      }

      const mergedAccount: AccountMe = {
        ...updatedAccount,
        profile: updatedProfile,
      };

      setAccount(mergedAccount);
      setPendingPhoto(null);
      setPhotoMarkedForRemoval(false);
      await setStoredJson(ACCOUNT_CACHE_KEY, mergedAccount);
      Alert.alert('Perfil atualizado', 'Suas configuracoes foram salvas.');
    } catch (err: any) {
      Alert.alert('Erro', err?.message ?? 'Nao foi possivel salvar o perfil.');
    } finally {
      setSaving(false);
    }
  };

  const openSupport = async () => {
    const url = 'mailto:suporte@gradatim.app';
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Suporte', 'Nao foi possivel abrir o app de email neste dispositivo.');
      return;
    }
    await Linking.openURL(url);
  };

  const confirmLogout = () => {
    Alert.alert('Sair da conta', 'Deseja encerrar sua sessao agora?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await api.logout();
          await deleteStoredString(ACCOUNT_CACHE_KEY);
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#070F21]">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAccount('refresh')} tintColor="#7DD3FC" />}
      >
        <View className="relative overflow-hidden rounded-md border border-[#2A3C60] bg-[#0E1A33] p-5">
          <View className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-blue-500/30" />
          <View className="absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-orange-500/30" />
          <Text className="text-2xl font-black text-white">Perfil e configuracoes</Text>
          <Text className="mt-1 text-sm text-blue-100">Dados da conta, privacidade e preferencias do app.</Text>

          {loading ? (
            <View className="mt-5 flex-row items-center gap-3">
              <ActivityIndicator color="#7DD3FC" />
              <Text className="text-sm text-slate-200">Carregando perfil...</Text>
            </View>
          ) : null}

          {!loading && error ? (
            <View className="mt-4 rounded-md border border-red-300/40 bg-red-500/20 p-3">
              <Text className="text-sm text-red-100">{error}</Text>
              <Pressable className="mt-3 self-start rounded-md bg-red-500 px-3 py-2" onPress={() => loadAccount('refresh')}>
                <Text className="font-semibold text-white">Tentar novamente</Text>
              </Pressable>
            </View>
          ) : null}

          {!loading && account && profile ? (
            <View className="mt-4 gap-4">
              <View className="rounded-md border border-[#324669] bg-white/10 p-4">
                <View style={styles.profileHeader}>
                  <View style={styles.avatarWrap}>
                    {avatarUri ? (
                      <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                    ) : (
                      <View style={styles.avatarFallback}>
                        <Text style={styles.avatarInitials}>{initialsFromName(fullNameLabel(account))}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.profileHeaderText}>
                    <Text className="text-base font-bold text-white">{fullNameLabel(account)}</Text>
                    <Text className="mt-1 text-sm text-blue-200">{account.username}</Text>
                    <Text className="mt-1 text-xs text-cyan-100">{profileTypeLabel(profile.user_type)}</Text>
                    {loadedFromCache ? <Text className="mt-1 text-xs text-amber-200">Exibindo dados offline salvos</Text> : null}
                  </View>
                </View>

                <View style={styles.photoActions}>
                  <Pressable style={styles.photoButton} onPress={handlePickPhoto}>
                    <Ionicons name="image-outline" size={16} color="#BAE6FD" />
                    <Text style={styles.photoButtonText}>{profile.profile_photo_url || pendingPhoto ? 'Trocar foto' : 'Adicionar foto'}</Text>
                  </Pressable>
                  {(profile.profile_photo_url || pendingPhoto) ? (
                    <Pressable style={[styles.photoButton, styles.photoButtonMuted]} onPress={handleRemovePhoto}>
                      <Ionicons name="trash-outline" size={16} color="#FECACA" />
                      <Text style={styles.photoButtonDangerText}>Remover</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>

              <View className="rounded-md border border-[#324669] bg-white/10 p-4">
                <Text className="text-xs uppercase tracking-wide text-cyan-100">Conta</Text>
                <TextInput style={styles.input} placeholder="Primeiro nome" placeholderTextColor="#8FA5CC" value={firstNameDraft} onChangeText={setFirstNameDraft} />
                <TextInput style={styles.input} placeholder="Sobrenome" placeholderTextColor="#8FA5CC" value={lastNameDraft} onChangeText={setLastNameDraft} />
                <TextInput
                  style={[styles.input, styles.lastInput]}
                  placeholder="Email"
                  placeholderTextColor="#8FA5CC"
                  value={emailDraft}
                  onChangeText={setEmailDraft}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View className="rounded-md border border-[#324669] bg-white/10 p-4">
                <View style={styles.treatmentHeader}>
                  <View style={styles.treatmentHeaderContent}>
                    <Text className="text-xs uppercase tracking-wide text-cyan-100">Jornada do tratamento</Text>
                    <Text className="mt-1 text-sm text-slate-200">
                      Dia {profile.current_day} de tratamento • {Math.round(profile.treatment_progress_percent || 0)}%
                    </Text>
                  </View>
                  <View style={styles.treatmentBadge}>
                    <Text style={styles.treatmentBadgeText}>Fim atual: {formatDateLabel(originalTreatmentEndDate)}</Text>
                  </View>
                </View>

                <View style={styles.editorGroup}>
                  <DatePickerField
                    label="Nova data final do tratamento"
                    value={treatmentEndDateDraft}
                    onChange={setTreatmentEndDateDraft}
                    minDate={profile.treatment_start_date ?? todayIsoDate()}
                    helperText="Ajuste a previsao com um toque em vez de digitar datas."
                  />
                </View>
              </View>

              <View className="rounded-md border border-[#324669] bg-white/10 p-4">
                <Text className="text-xs uppercase tracking-wide text-cyan-100">Sobre voce</Text>
                <TextInput
                  style={styles.bioInput}
                  placeholder="Conte um pouco sobre voce, sua rotina ou o que quer acompanhar no app."
                  placeholderTextColor="#8FA5CC"
                  value={bioDraft}
                  onChangeText={setBioDraft}
                  multiline
                />
              </View>

              <View className="rounded-md border border-[#324669] bg-white/10 p-4">
                <Text className="text-xs uppercase tracking-wide text-cyan-100">Preferencias do app</Text>
                <SettingsToggleRow
                  title="Lembretes diarios"
                  description="Destacar sua rotina de check-in no app."
                  value={settings.remindersEnabled}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, remindersEnabled: value }))}
                />
                <SettingsToggleRow
                  title="Cards de insight"
                  description="Exibir resumos e atalhos personalizados nas telas principais."
                  value={settings.insightCardsEnabled}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, insightCardsEnabled: value }))}
                />
                <SettingsToggleRow
                  title="Modo privado"
                  description="Disfarcar descricoes mais sensiveis quando outras pessoas estiverem olhando."
                  value={settings.privateModeEnabled}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, privateModeEnabled: value }))}
                  compact
                />
              </View>

              <TouchableSettingsRow
                icon="key-outline"
                title="Trocar senha"
                description="Usar o fluxo de recuperacao para definir uma nova senha."
                onPress={() => router.push('/(auth)/forgotpassword')}
              />

              <TouchableSettingsRow
                icon="mail-outline"
                title="Suporte"
                description="Abrir email para falar com o time do app."
                onPress={openSupport}
              />

              <Pressable
                onPress={handleSave}
                disabled={!hasChanges || saving}
                className={`rounded-md p-4 ${!hasChanges || saving ? 'bg-[#36527A]' : 'bg-[#0B63F6]'}`}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text className="text-center text-base font-bold text-white">Salvar alteracoes</Text>
                    <Text className="mt-1 text-center text-xs text-blue-100">
                      Atualize conta, foto, bio e previsao de termino do tratamento.
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : null}
        </View>

        <View className="mt-4 gap-2">
          <Pressable onPress={confirmLogout} className="rounded-md border border-red-300/40 bg-red-500/20 p-4">
            <Text className="font-semibold text-red-100">Sair</Text>
            <Text className="text-xs text-red-200">Encerrar sessao atual neste dispositivo</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TouchableSettingsRow({
  icon,
  title,
  description,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  onPress: () => void | Promise<void>;
}) {
  return (
    <Pressable onPress={onPress} className="rounded-md border border-[#324669] bg-white/10 p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-cyan-500/15">
            <Ionicons name={icon} size={20} color="#BFDBFE" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-white">{title}</Text>
            <Text className="mt-1 text-xs text-blue-100">{description}</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#BFDBFE" />
      </View>
    </Pressable>
  );
}

function SettingsToggleRow({
  title,
  description,
  value,
  onValueChange,
  compact = false,
}: {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  compact?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, compact && styles.lastToggleRow]}>
      <View style={styles.toggleTextBlock}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#324669', true: '#0B63F6' }}
        thumbColor="#EAF4FF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  profileHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  avatarWrap: {
    width: 82,
    height: 82,
    borderRadius: 41,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(125, 211, 252, 0.45)',
    backgroundColor: 'rgba(6, 182, 212, 0.16)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#CFFAFE',
    fontSize: 26,
    fontWeight: '800',
  },
  photoActions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#2E4D79',
    backgroundColor: '#10213F',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  photoButtonMuted: {
    backgroundColor: 'rgba(127, 29, 29, 0.22)',
    borderColor: 'rgba(248, 113, 113, 0.35)',
  },
  photoButtonText: {
    color: '#BAE6FD',
    fontSize: 13,
    fontWeight: '700',
  },
  photoButtonDangerText: {
    color: '#FECACA',
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2E4D79',
    borderRadius: 14,
    padding: 14,
    color: '#F0F7FF',
    backgroundColor: '#10213F',
    fontSize: 15,
  },
  lastInput: {
    marginBottom: 0,
  },
  editorGroup: {
    marginTop: 16,
  },
  treatmentHeader: {
    gap: 12,
  },
  treatmentHeaderContent: {
    minWidth: 0,
  },
  treatmentBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  treatmentBadgeText: {
    color: '#CFFAFE',
    fontSize: 12,
    fontWeight: '600',
  },
  bioInput: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2E4D79',
    borderRadius: 14,
    padding: 14,
    minHeight: 120,
    color: '#F0F7FF',
    backgroundColor: '#10213F',
    textAlignVertical: 'top',
    fontSize: 15,
  },
  toggleRow: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  lastToggleRow: {
    paddingBottom: 0,
  },
  toggleTextBlock: {
    flex: 1,
  },
  toggleTitle: {
    color: '#EAF4FF',
    fontSize: 15,
    fontWeight: '600',
  },
  toggleDescription: {
    marginTop: 4,
    color: '#9FB2D8',
    fontSize: 12,
    lineHeight: 18,
  },
});
