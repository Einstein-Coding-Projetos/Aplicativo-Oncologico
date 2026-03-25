import * as SecureStore from 'expo-secure-store';
import { endpoints } from '../constants/api';

const ACCESS_KEY = 'jwt_access';
const REFRESH_KEY = 'jwt_refresh';
const memoryStore = new Map<string, string>();

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  user_type: string;
  bio: string | null;
  profile_photo_url: string | null;
  treatment_start_date: string | null;
  treatment_duration_days: number | null;
  current_day: number;
  treatment_progress_percent: number;
  activity_streak: number;
  today_activity_completed: boolean;
  created_at: string;
  is_staff: boolean;
};

export type AccountMe = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile: UserProfile | null;
  is_staff: boolean;
};

type UploadableAsset = {
  uri: string;
  name?: string;
  type?: string;
};

function getBrowserStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

async function storageGet(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    const browserStorage = getBrowserStorage();
    if (browserStorage) return browserStorage.getItem(key);
    return memoryStore.get(key) ?? null;
  }
}

async function storageSet(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    const browserStorage = getBrowserStorage();
    if (browserStorage) {
      browserStorage.setItem(key, value);
      return;
    }
    memoryStore.set(key, value);
  }
}

async function storageDelete(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    const browserStorage = getBrowserStorage();
    if (browserStorage) {
      browserStorage.removeItem(key);
      return;
    }
    memoryStore.delete(key);
  }
}

async function getAccessToken(): Promise<string | null> {
  return storageGet(ACCESS_KEY);
}

async function saveTokens(access: string, refresh: string): Promise<void> {
  await storageSet(ACCESS_KEY, access);
  await storageSet(REFRESH_KEY, refresh);
}

async function clearTokens(): Promise<void> {
  await storageDelete(ACCESS_KEY);
  await storageDelete(REFRESH_KEY);
}

function isFormDataBody(body: BodyInit | null | undefined): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = await storageGet(REFRESH_KEY);
  if (!refresh) return null;

  try {
    const res = await fetch(endpoints.tokenRefresh, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      await clearTokens();
      return null;
    }

    const data = await res.json();
    await storageSet(ACCESS_KEY, data.access);
    return data.access;
  } catch {
    return null;
  }
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token = await getAccessToken();

  const makeRequest = (t: string | null) => {
    const body = options.body;
    const isMultipart = isFormDataBody(body);
    return fetch(url, {
      ...options,
      headers: {
        ...(isMultipart ? {} : { 'Content-Type': 'application/json' }),
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        ...(options.headers ?? {}),
      },
    });
  };

  let res = await makeRequest(token);

  if (res.status === 401) {
    token = await refreshAccessToken();
    if (token) {
      res = await makeRequest(token);
    }
  }

  return res;
}

const api = {
  async login(username: string, password: string): Promise<void> {
    const res = await fetch(endpoints.token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error('Credenciais invalidas');

    const { access, refresh } = await res.json();
    await saveTokens(access, refresh);
  },

  async register(username: string, password: string, email?: string, is_psicologo: boolean = false): Promise<void> {
    const res = await fetch(endpoints.register || '/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        password,
        email,
        is_psicologo
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.erro ?? 'Não foi possível criar a conta.');
    }
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await getAccessToken();
    if (!token) return false;

    const res = await authFetch(endpoints.me, { method: 'GET' });
    return res.ok;
  },

  async forgotPassword(email: string): Promise<{ mensagem: string; uid?: string; token?: string }> {
    const res = await fetch(endpoints.forgotPassword, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.erro ?? 'Nao foi possivel iniciar a recuperacao de senha.');
    return data;
  },

  async resetPassword(uid: string, token: string, newPassword: string): Promise<void> {
    const res = await fetch(endpoints.resetPassword, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, token, new_password: newPassword }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.erro ?? 'Nao foi possivel redefinir a senha.');
    }
  },

  async fetchAppointments() {
    const res = await authFetch(endpoints.appointmentPending);
    if (!res.ok) throw new Error(`Erro ao buscar consultas: ${res.status}`);
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id.toString(),
      profissional: item.psicologo_nome || item.psicologo || "Não informado",
      date: item.date,
      horario: item.horario,
      status: item.status,
    }));
  },

  async createAppointment(payload: { psicologoId: number; date: string | Date; horario: string }) {
    let dateString = '';
    if (typeof payload.date === 'string') {
      dateString = payload.date.substring(0, 10);
    } else {
      const ano = payload.date.getFullYear();
      const mes = String(payload.date.getMonth() + 1).padStart(2, '0');
      const dia = String(payload.date.getDate()).padStart(2, '0');
      dateString = `${ano}-${mes}-${dia}`;
    }

    const res = await authFetch(endpoints.appointments, {
      method: 'POST',
      body: JSON.stringify({
        psicologo: payload.psicologoId, // Alinhado com o models.py
        date: dateString,
        horario: payload.horario
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.erro ?? 'Erro ao agendar');
    }

    return res.json();
  },
  async completeAppointment(id: number | string) {
    const res = await authFetch(endpoints.appointmentConcluir(id), { method: 'POST' });
    return res.ok;
  },

  async fetchConcluidas() {
    const res = await authFetch(endpoints.appointmentCompleted);
    if (!res.ok) throw new Error(`Erro ao buscar concluidas: ${res.status}`);
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id.toString(),
      profissional: item.profissional,
      date: item.date,
      horario: item.horario,
      status: item.status,
    }));
  },

  async fetchHorariosOcupados(nomeProfissional: string) {
    const res = await authFetch(endpoints.appointmentOccupied(nomeProfissional));
    if (!res.ok) return [];
    return res.json();
  },

  async deleteAllHistory() {
    const res = await authFetch(endpoints.appointmentClearDone, { method: 'DELETE' });
    return res.ok;
  },

  async fetchUserProfile(): Promise<UserProfile> {
    const res = await authFetch(endpoints.userProfile);
    if (!res.ok) throw new Error(`Erro ao buscar perfil: ${res.status}`);
    return res.json();
  },

  async fetchAccountMe(): Promise<AccountMe> {
    const res = await authFetch(endpoints.me);
    if (!res.ok) throw new Error(`Erro ao buscar conta: ${res.status}`);
    return res.json();
  },

  async updateAccountMe(payload: Partial<Pick<AccountMe, 'email' | 'first_name' | 'last_name'>>) {
    const res = await authFetch(endpoints.me, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.erro ?? 'Nao foi possivel atualizar sua conta.');
    return data as AccountMe;
  },

  async updateUserProfile(
    id: number | string,
    payload: Partial<Pick<UserProfile, 'bio' | 'treatment_start_date' | 'treatment_duration_days' | 'user_type'>> | FormData
  ) {
    const res = await authFetch(endpoints.userProfileById(id), {
      method: 'PATCH',
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.erro ?? 'Nao foi possivel atualizar o perfil.');
    return data as UserProfile;
  },

  async uploadProfilePhoto(id: number | string, asset: UploadableAsset) {
    const form = new FormData();
    form.append('profile_photo', {
      uri: asset.uri,
      name: asset.name ?? 'profile-photo.jpg',
      type: asset.type ?? 'image/jpeg',
    } as any);

    return this.updateUserProfile(id, form);
  },

  async removeProfilePhoto(id: number | string) {
    return this.updateUserProfile(id, { remove_profile_photo: true } as any);
  },

  async completeTreatmentOnboarding(payload: { treatmentEndDate: string; bio?: string }) {
    const profile = await this.fetchUserProfile();
    const today = new Date();
    const endDate = new Date(`${payload.treatmentEndDate}T00:00:00`);

    if (Number.isNaN(endDate.getTime())) {
      throw new Error('Data final invalida. Use o formato AAAA-MM-DD.');
    }

    const msPerDay = 24 * 60 * 60 * 1000;
    const startDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    const diffDays = Math.floor((endDateOnly.getTime() - startDateOnly.getTime()) / msPerDay) + 1;

    if (diffDays < 1) {
      throw new Error('A data final deve ser hoje ou uma data futura.');
    }

    const treatmentStartDate = [
      startDateOnly.getFullYear(),
      String(startDateOnly.getMonth() + 1).padStart(2, '0'),
      String(startDateOnly.getDate()).padStart(2, '0'),
    ].join('-');

    return this.updateUserProfile(profile.id, {
      treatment_start_date: treatmentStartDate,
      treatment_duration_days: diffDays,
      bio: payload.bio?.trim() ? payload.bio.trim() : profile.bio,
    });
  },

  async fetchRelatoDoDia() {
    const res = await authFetch(endpoints.relatoDoDia);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 404) {
        throw new Error(data.mensagem ?? 'Nenhum relato disponivel');
      }
      throw new Error(data.erro ?? 'Erro ao buscar relato');
    }
    return res.json();
  },

  async fetchPsicologoAgenda() {
    const res = await authFetch('/psicologo/agenda/');
    if (!res.ok) throw new Error('Erro ao carregar agenda');
    return res.json();
  },

  async saveDisponibilidade(date: string, slots: string[]) {
    const res = await authFetch('/psicologo/agenda/', {
      method: 'POST',
      body: JSON.stringify({ date, slots }),
    });
    if (!res.ok) throw new Error('Erro ao salvar horários');
    return res.json();
  },
};
export default api;