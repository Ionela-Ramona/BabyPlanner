/** Bebelusul asa cum il intoarce API-ul (BabyDto). */
export interface Baby {
  readonly id: number;
  readonly name: string;

  /**
   * Data nasterii, format ISO `YYYY-MM-DD`.
   * In backend e `DateOnly`, deci nu are ora si nu are fus orar — o tinem ca text
   * ca sa nu o transformam din greseala intr-un moment din timp.
   */
  readonly dateOfBirth: string;
}

/** Corpul cererii de creare (CreateBabyRequest). Id-ul il genereaza serverul. */
export interface CreateBabyRequest {
  readonly name: string;
  readonly dateOfBirth: string;
}

/**
 * Corpul cererii de actualizare. Azi are exact aceleasi campuri ca la creare —
 * il tinem sub nume propriu ca sa nu trebuiasca schimbate semnaturile daca
 * backendul le diferentiaza mai tarziu.
 */
export type UpdateBabyRequest = CreateBabyRequest;
