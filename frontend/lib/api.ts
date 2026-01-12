type Appointment = {
  id: string;
  title?: string;
  profissional?: string;
  date: string;
  horario: string;
  status?: string;
};

type NewAppointment = {
  profissional: string;
  date: string | Date;
  horario: string;
};

// Simple in-memory store that survives module lifetime
const store: Appointment[] = [
  // seed example
  {
    id: '1',
    title: 'Consulta com Dra. Silva',
    profissional: 'Dra. Silva',
    date: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    horario: '10:00',
    status: 'agendado',
  },
];

export default {
  async fetchAppointments(): Promise<Appointment[]> {
    // TODO: replace with real network call to backend when available
    return Promise.resolve([...store]);
  },

  async createAppointment(payload: NewAppointment): Promise<Appointment> {
    const a: Appointment = {
      id: Date.now().toString(),
      title: `Consulta com ${payload.profissional}`,
      profissional: payload.profissional,
      date: typeof payload.date === 'string' ? payload.date : payload.date.toISOString(),
      horario: payload.horario,
      status: 'agendado',
    };
    store.unshift(a);
    return Promise.resolve(a);
  },

  async completeAppointment(id: number | string): Promise<boolean> {
    const sid = String(id);
    const idx = store.findIndex((s) => s.id === sid);
    if (idx === -1) return Promise.reject(new Error('Appointment not found'));
    store[idx].status = 'concluido';
    return Promise.resolve(true);
  },
};
