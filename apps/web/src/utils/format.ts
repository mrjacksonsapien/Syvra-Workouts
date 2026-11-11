import type { MuscleGroup } from '@syvra/shared';

// 'full_body' -> 'Full body'
export function muscleGroupLabel(group: MuscleGroup): string {
  const text = group.replace('_', ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// '2026-11-16' -> 'Nov 16, 2026'. UTC keeps the day the same in every time zone.
export function formatDate(date: string | null): string {
  if (date === null) return 'Unscheduled';
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  });
}

// '4 × 8 · 60 kg · 120 s' (weight and rest are left out when not set)
export function formatSetsReps(
  sets: number,
  reps: number,
  weightKg: number | null,
  restSeconds: number | null,
): string {
  const parts = [`${sets} × ${reps}`];
  if (weightKg !== null) parts.push(`${weightKg} kg`);
  if (restSeconds !== null) parts.push(`${restSeconds} s`);
  return parts.join(' · ');
}
