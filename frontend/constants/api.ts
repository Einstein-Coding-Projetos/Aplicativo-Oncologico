const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

export const endpoints = {
  // Auth
  token:        `${BASE_URL}/api/token/`,
  tokenRefresh: `${BASE_URL}/api/token/refresh/`,
  register:     `${BASE_URL}/api/accounts/register/`,
  me:           `${BASE_URL}/api/accounts/me/`,
  forgotPassword: `${BASE_URL}/api/accounts/forgot-password/`,
  resetPassword: `${BASE_URL}/api/accounts/reset-password/`,

  // Appointments
  appointments:          `${BASE_URL}/api/appointments/`,
  appointmentPending:    `${BASE_URL}/api/appointments/pending/`,
  appointmentCompleted:  `${BASE_URL}/api/appointments/completed/`,
  appointmentConcluir:   (id: number | string) => `${BASE_URL}/api/appointments/${id}/mark_completed/`,
  appointmentOccupied:   (nome: string) => `${BASE_URL}/api/appointments/occupied-slots/?profissional=${encodeURIComponent(nome)}`,
  appointmentClearDone:  `${BASE_URL}/api/appointments/clear-completed/`,

  // User profile
  userProfile: `${BASE_URL}/api/user-profile/me/`,
  userProfileById: (id: number | string) => `${BASE_URL}/api/user-profile/${id}/`,

  // Relatos
  relatoDoDia:    `${BASE_URL}/api/relato-do-dia/`,
  relatoAleatorio:`${BASE_URL}/api/relato-aleatorio/`,
};
