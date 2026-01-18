//colocar seu ip
const API_URL = 'http://ip:8000'; 

export default {
  // --- INICIALIZAÇÃO ---
  async init() {
    return; // Não precisa criar tabela, o PostgreSQL já tem ela.
  },

  // --- BUSCAR LISTA ---
  async fetchAppointments() {
    try {
      const response = await fetch(`${API_URL}/agendar`);
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar: ${response.status}`);
      }
      
      const data = await response.json();

      // Mapeia o JSON que vem do Python para o App
      return data.map((item: any) => ({
        id: item.id.toString(),
        profissional: item.profissional,
        date: item.date, // O Python já manda como string (YYYY-MM-DD)
        horario: item.horario,
        status: item.status
      }));

    } catch (error) {
      console.error("Erro no fetchAppointments:", error);
      return [];
    }
  },

  async createAppointment(payload: { profissional: string, date: string | Date, horario: string }) {
    // Garante que a data seja YYYY-MM-DD para o banco aceitar
    let dateString = '';
    if (typeof payload.date === 'string') {
        dateString = payload.date.substring(0, 10); // Pega só os 10 primeiros caracteres para garantir "YYYY-MM-DD"
    } else {
        const ano = payload.date.getFullYear();
        const mes = String(payload.date.getMonth() + 1).padStart(2, '0'); //string: nome do mês; pegar o número do mês + 1, pois janeiro é zero; o padStart garante que o mês seja escrito com dois dígitos 
        const dia = String(payload.date.getDate()).padStart(2, '0');
        dateString = `${ano}-${mes}-${dia}`;
    }

    try {
      const response = await fetch(`${API_URL}/agendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Enviamos com os nomes que o Python espera ler
          psicologo: payload.profissional, 
          dia: dateString,
          horario: payload.horario
        }),
      });

      if (!response.ok) {
         const erro = await response.text();
         throw new Error(`Erro do Python: ${erro}`);
      }

      // Se deu certo, retornamos o objeto para a tela atualizar
      return {
        id: Date.now().toString(), // ID provisório pra tela não piscar
        profissional: payload.profissional,
        date: payload.date, // Mantém o formato original pra tela
        horario: payload.horario,
        status: 'agendado',
      };

    } catch (error) {
      console.error("Erro ao criar:", error);
      throw error;
    }
  },

  async completeAppointment(id: number | string) {
    try {
      // Chama a nova rota que criamos
      const response = await fetch(`${API_URL}/concluir/${id}`, {
        method: 'POST', // Usando POST para evitar problemas de configuração de PUT
      });
      return response.ok;
    } catch (error) {
      console.error("Erro ao concluir:", error);
      return [];
    }
  },
};