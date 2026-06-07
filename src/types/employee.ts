/**
 * Employee — shape compartido entre la UI y la API.
 *
 * Refleja el JSON que devuelve el orchestrator (`GET /employees`,
 * `GET /employees/:id`). Los campos opcionales pueden venir `null` o
 * faltar según el endpoint.
 */
export interface Employee {
  id: string;
  companyId?: string;
  name: string;
  /** Email opcional. Si está set, el manager puede mandar invitación de
   * login al employee desde la tabla (sino solo existe como registro HR). */
  email?: string | null;
  role: string;
  /** Algunos endpoints exponen `phone`, otros `phone_number`. */
  phone?: string;
  /** Identificador de la empresa en su sistema de nómina/asistencia. */
  externalId?: string | null;
  experienceMonths?: number;
  locale?: string;
  departmentId?: string | null;
  /** true si el employee tiene auth_user_id (puede loguearse). Derivado
   * en el backend desde `employees.auth_user_id IS NOT NULL`. */
  hasAccount?: boolean;
  /** Estado de la cuenta de login:
   *   - active   = ya aceptó invitación y puede loguearse
   *   - pending  = tiene invitación en curso, esperando que la acepte
   *   - none     = no tiene email o no se mandó invitación todavía
   * Backend lo computa en GET /employees. */
  accountStatus?: 'active' | 'pending' | 'none';
  /**
   * Skills cargadas via join (puede no venir en list endpoints). El backend
   * devuelve cada skill resuelta — id, nombre y nivel — no solo el id.
   * (La grilla de horarios usa un tipo paralelo en `store/scheduleStore.ts`
   * con shape mock; ese sigue siendo `string[]` hasta que se conecte a
   * datos reales.)
   */
  skills?: Array<{ id: string; name: string; level: string }>;
  isActive?: boolean;
}

/**
 * Body de POST /employees. El UUID interno lo genera el backend; aquí
 * sólo enviamos los datos visibles al manager.
 */
export interface CreateEmployeePayload {
  name: string;
  email?: string;
  phone: string;
  experienceMonths: number;
  externalId?: string;
}

/** Body de PATCH /employees/:id (todos opcionales — partial update). */
export interface UpdateEmployeePayload {
  name?: string;
  email?: string | null;
  role?: string;
  phoneNumber?: string;
  experienceMonths?: number;
  departmentId?: string | null;
  locale?: string;
  contractType?: string | null;
  maxHoursPerDay?: number | null;
  maxHoursPerWeek?: number | null;
  isActive?: boolean;
  externalId?: string | null;
}
