// Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

type Appointment = {
  id: number;
  title: string;
  date: string;
  status: 'agendado' | 'concluído' | 'pendente';
};

type NewAppointment = {
  title: string;
  date: string;
};

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export default {
  async fetchAppointments(): Promise<Appointment[]> {
    try {
      const data = await request('/appointments/pending/');
      return data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw error;
    }
  },

  async createAppointment(payload: NewAppointment): Promise<Appointment> {
    try {
      const data = await request('/appointments/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  async completeAppointment(id: number | string): Promise<boolean> {
    try {
      await request(`/appointments/${id}/mark_completed/`, {
        method: 'POST',
      });
      return true;
    } catch (error) {
      console.error('Error completing appointment:', error);
      throw error;
    }
  },
};
