/**
 * Tipurile de activitate.
 *
 * Backendul le serializeaza ca text ("Feeding"), nu ca numere — vezi
 * JsonStringEnumConverter din Program.cs. Folosim o lista `as const` plus un union
 * type, nu un `enum` TypeScript: valorile sunt exact sirurile care circula pe fir,
 * iar ACTIVITY_TYPES ne da si o lista iterabila pentru filtre si formulare.
 */
export const ACTIVITY_TYPES = ['Feeding', 'Sleep', 'Diaper', 'Medicine', 'Other'] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/** Etichetele afisate in interfata. Cheile sunt verificate de compilator. */
export const ACTIVITY_TYPE_LABELS: Readonly<Record<ActivityType, string>> = {
  Feeding: 'Masă',
  Sleep: 'Somn',
  Diaper: 'Scutec',
  Medicine: 'Medicamente',
  Other: 'Altele',
};
