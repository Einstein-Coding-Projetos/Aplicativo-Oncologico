export function todayIsoDate(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

export function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function formatDateLabel(value: string | null | undefined): string {
  if (!value) return 'Selecionar data';
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

export function profileTreatmentEndDate(
  treatmentStartDate: string | null | undefined,
  treatmentDurationDays: number | null | undefined
): string | null {
  if (!treatmentStartDate || !treatmentDurationDays) return null;

  const start = parseIsoDate(treatmentStartDate);
  start.setDate(start.getDate() + treatmentDurationDays - 1);

  return [
    start.getFullYear(),
    String(start.getMonth() + 1).padStart(2, '0'),
    String(start.getDate()).padStart(2, '0'),
  ].join('-');
}

export function buildTreatmentJourneyPayload(
  treatmentEndDate: string,
  currentTreatmentStartDate?: string | null
): { treatment_start_date: string; treatment_duration_days: number } {
  const startDateIso = currentTreatmentStartDate ?? todayIsoDate();
  const startDate = parseIsoDate(startDateIso);
  const endDate = parseIsoDate(treatmentEndDate);
  const msPerDay = 24 * 60 * 60 * 1000;
  const durationDays = Math.floor((endDate.getTime() - startDate.getTime()) / msPerDay) + 1;

  if (durationDays < 1) {
    throw new Error('A data final deve ser hoje ou uma data futura.');
  }

  return {
    treatment_start_date: startDateIso,
    treatment_duration_days: durationDays,
  };
}
