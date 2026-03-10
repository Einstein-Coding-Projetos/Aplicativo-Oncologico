import * as SecureStore from 'expo-secure-store';
import { endpoints } from '../constants/api';

const ACCESS_KEY = 'jwt_access';
const REFRESH_KEY = 'jwt_refresh';
const memoryStore = new Map<string, string>();

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
    return;
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
    return;
  } catch {
    const browserStorage = getBrowserStorage();
    if (browserStorage) {
      browserStorage.removeItem(key);
      return;
    }
    memoryStore.delete(key);
  }
}

// ─── Token storage ───────────────────────────────────────────────────────────

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

// ─── Token refresh ───────────────────────────────────────────────────────────

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

// ─── Authenticated fetch ──────────────────────────────────────────────────────
// Attaches Bearer token; on 401 tries one refresh then retries once.

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token = await getAccessToken();

  const makeRequest = (t: string | null) =>
    fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        ...(options.headers ?? {}),
      },
    });

  let res = await makeRequest(token);

  if (res.status === 401) {
    token = await refreshAccessToken();
    if (token) {
      res = await makeRequest(token);
    }
  }

  return res;
}

// ─── Public API ───────────────────────────────────────────────────────────────

const api = {

  // Auth -----------------------------------------------------------------------

  async login(username: string, password: string): Promise<void> {
    const res = await fetch(endpoints.token, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) throw new Error('Credenciais inválidas');

    const { access, refresh } = await res.json();
    await saveTokens(access, refresh);
  },

  async register(username: string, password: string, email?: string): Promise<void> {
    const res = await fetch(endpoints.register, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.erro ?? 'Erro ao criar conta');
    }
  },

  async logout(): Promise<void> {
    await clearTokens();
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

  // Appointments ---------------------------------------------------------------

  async fetchAppointments() {
    const res = await authFetch(endpoints.appointmentPending);
    if (!res.ok) throw new Error(`Erro ao buscar consultas: ${res.status}`);
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id.toString(),
      profissional: item.profissional,
      date: item.date,
      horario: item.horario,
      status: item.status,
    }));
  },

  async createAppointment(payload: { profissional: string; date: string | Date; horario: string }) {
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
      body: JSON.stringify({ profissional: payload.profissional, date: dateString, horario: payload.horario }),
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
    if (!res.ok) throw new Error(`Erro ao buscar concluídas: ${res.status}`);
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

  // User profile ---------------------------------------------------------------

  async fetchUserProfile() {
    const res = await authFetch(endpoints.userProfile);
    if (!res.ok) throw new Error(`Erro ao buscar perfil: ${res.status}`);
    return res.json();
  },

  // Relatos --------------------------------------------------------------------

  async fetchRelatoDoDia() {
    const res = await authFetch(endpoints.relatoDoDia);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (res.status === 404) {
        throw new Error(data.mensagem ?? 'Nenhum relato disponível');
      }
      throw new Error(data.erro ?? 'Erro ao buscar relato');
    }
    return res.json();
  },
};

export default api;
